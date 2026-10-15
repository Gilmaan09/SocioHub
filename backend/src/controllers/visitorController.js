const Visitor = require('../models/Visitor')
const Flat = require('../models/Flat')
const { notifyFlatResidents, notifyWatchman } = require('../services/notificationService')
const {
  isValidId,
} = require('../utils/structureControllerUtils')

const residentRoles = ['OWNER', 'TENANT']


/*
  Watchman registers a new visitor
*/
async function createVisitor(request, response, next) {
  try {
    const societyId = request.user.societyId
    const watchmanId = request.user._id

    if (!societyId) {
      return response.status(400).json({
        message:
          'Watchman is not assigned to a society',
      })
    }

    const {
      visitorName,
      phone,
      flatId,
      purpose,
      vehicleNumber,
      visitorCount,
    } = request.body

    if (!visitorName || !flatId || !purpose) {
      return response.status(400).json({
        message:
          'Visitor name, flat, and purpose are required',
      })
    }

    if (!isValidId(flatId)) {
      return response.status(400).json({
        message: 'Invalid flat',
      })
    }

    const flat = await Flat.findOne({
      _id: flatId,
      societyId,
    })

    if (!flat) {
      return response.status(404).json({
        message:
          'Flat not found in your society',
      })
    }

    const visitor = await Visitor.create({
      societyId,
      watchmanId,
      visitorName,
      phone,
      flatId,
      purpose,
      vehicleNumber,
      visitorCount:
        Number(visitorCount) || 1,
      status: 'WAITING',
      entryTime: new Date(),
    })

    await notifyFlatResidents(societyId, flatId, {
      societyId,
      type: 'VISITOR_REQUEST',
      title: 'Visitor approval requested',
      message: `${visitorName} is waiting at the gate: ${purpose}`,
      href: '/resident/visitors',
      entityType: 'VISITOR',
      entityId: visitor._id,
      eventKey: `visitor-request:${visitor._id}`,
    })

    const populatedVisitor =
      await Visitor.findById(visitor._id)
        .populate(
          'flatId',
          'number floor wingId'
        )
        .populate(
          'watchmanId',
          'name phone'
        )

    return response.status(201).json({
      message:
        'Visitor registered successfully',
      visitor: populatedVisitor,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Watchman sees today's visitors
*/
async function getTodayVisitors(
  request,
  response,
  next
) {
  try {
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message:
          'Watchman is not assigned to a society',
      })
    }

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const visitors = await Visitor.find({
      societyId,
      entryTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate(
        'flatId',
        'number floor wingId'
      )
      .populate(
        'watchmanId',
        'name phone'
      )
      .sort({
        entryTime: -1,
      })

    return response.json({
      visitors,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Watchman sees visitors waiting for approval
*/
async function getWaitingVisitors(
  request,
  response,
  next
) {
  try {
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message:
          'Watchman is not assigned to a society',
      })
    }

    const visitors = await Visitor.find({
      societyId,
      status: 'WAITING',
    })
      .populate(
        'flatId',
        'number floor wingId'
      )
      .populate(
        'watchmanId',
        'name phone'
      )
      .sort({
        entryTime: -1,
      })

    return response.json({
      visitors,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Resident sees visitors for their own flat
*/
async function getMyFlatVisitors(
  request,
  response,
  next
) {
  try {
    const societyId = request.user.societyId
    const flatId = request.user.flatId

    if (!societyId || !flatId) {
      return response.status(400).json({
        message:
          'You are not assigned to a flat',
      })
    }

    const visitors = await Visitor.find({
      societyId,
      flatId,
    })
      .populate(
        'watchmanId',
        'name phone'
      )
      .populate(
        'flatId',
        'number floor wingId'
      )
      .sort({
        entryTime: -1,
      })

    return response.json({
      visitors,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Resident approves visitor
*/
async function approveVisitor(
  request,
  response,
  next
) {
  try {
    const societyId = request.user.societyId
    const residentId = request.user._id
    const flatId = request.user.flatId

    if (
      !societyId ||
      !flatId ||
      !residentRoles.includes(
        request.user.role
      )
    ) {
      return response.status(403).json({
        message:
          'Resident access required',
      })
    }

    if (!isValidId(request.params.id)) {
      return response.status(400).json({
        message:
          'Invalid visitor ID',
      })
    }

    const visitor =
      await Visitor.findOne({
        _id: request.params.id,
        societyId,
        flatId,
        status: 'WAITING',
      })

    if (!visitor) {
      return response.status(404).json({
        message:
          'Visitor not found or already processed',
      })
    }

    visitor.status = 'APPROVED'
    visitor.approvedBy = residentId
    visitor.approvedAt = new Date()

    await visitor.save()

    await notifyWatchman(visitor.watchmanId, {
      societyId,
      type: 'VISITOR_DECISION',
      title: 'Visitor approved',
      message: `The resident approved ${visitor.visitorName}.`,
      href: '/watchman/visitors',
      entityType: 'VISITOR',
      entityId: visitor._id,
      eventKey: `visitor-decision:${visitor._id}:APPROVED`,
    })

    return response.json({
      message:
        'Visitor approved successfully',
      visitor,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Resident rejects visitor
*/
async function rejectVisitor(
  request,
  response,
  next
) {
  try {
    const societyId = request.user.societyId
    const residentId = request.user._id
    const flatId = request.user.flatId

    if (
      !societyId ||
      !flatId ||
      !residentRoles.includes(
        request.user.role
      )
    ) {
      return response.status(403).json({
        message:
          'Resident access required',
      })
    }

    if (!isValidId(request.params.id)) {
      return response.status(400).json({
        message:
          'Invalid visitor ID',
      })
    }

    const visitor =
      await Visitor.findOne({
        _id: request.params.id,
        societyId,
        flatId,
        status: 'WAITING',
      })

    if (!visitor) {
      return response.status(404).json({
        message:
          'Visitor not found or already processed',
      })
    }

    visitor.status = 'REJECTED'
    visitor.rejectedBy = residentId
    visitor.rejectedAt = new Date()

    await visitor.save()

    await notifyWatchman(visitor.watchmanId, {
      societyId,
      type: 'VISITOR_DECISION',
      title: 'Visitor rejected',
      message: `The resident rejected ${visitor.visitorName}.`,
      href: '/watchman/visitors',
      entityType: 'VISITOR',
      entityId: visitor._id,
      eventKey: `visitor-decision:${visitor._id}:REJECTED`,
    })

    return response.json({
      message:
        'Visitor rejected successfully',
      visitor,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Watchman marks visitor as entered
*/
async function markVisitorEntry(
  request,
  response,
  next
) {
  try {
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message:
          'Watchman is not assigned to a society',
      })
    }

    if (!isValidId(request.params.id)) {
      return response.status(400).json({
        message:
          'Invalid visitor ID',
      })
    }

    const visitor =
      await Visitor.findOne({
        _id: request.params.id,
        societyId,
      })

    if (!visitor) {
      return response.status(404).json({
        message:
          'Visitor not found',
      })
    }

    if (visitor.status !== 'APPROVED') {
      return response.status(400).json({
        message:
          'Only approved visitors can enter',
      })
    }

    visitor.status = 'INSIDE'

    /*
      entryTime already represents the
      visitor registration/request time.

      We keep it unchanged and only change
      the status to INSIDE here.
    */
    await visitor.save()

    const populatedVisitor =
      await Visitor.findById(visitor._id)
        .populate(
          'flatId',
          'number floor wingId'
        )
        .populate(
          'watchmanId',
          'name phone'
        )

    return response.json({
      message:
        'Visitor entry recorded successfully',
      visitor: populatedVisitor,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Watchman marks visitor as exited
*/
async function markVisitorExit(
  request,
  response,
  next
) {
  try {
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message:
          'Watchman is not assigned to a society',
      })
    }

    if (!isValidId(request.params.id)) {
      return response.status(400).json({
        message:
          'Invalid visitor ID',
      })
    }

    const visitor =
      await Visitor.findOne({
        _id: request.params.id,
        societyId,
      })

    if (!visitor) {
      return response.status(404).json({
        message:
          'Visitor not found',
      })
    }

    /*
      Visitor must actually be INSIDE
      before the Watchman can mark exit.
    */
    if (visitor.status !== 'INSIDE') {
      return response.status(400).json({
        message:
          'Only visitors who are inside can exit',
      })
    }

    visitor.status = 'EXITED'
    visitor.exitTime = new Date()

    await visitor.save()

    const populatedVisitor =
      await Visitor.findById(visitor._id)
        .populate(
          'flatId',
          'number floor wingId'
        )
        .populate(
          'watchmanId',
          'name phone'
        )

    return response.json({
      message:
        'Visitor exit recorded successfully',
      visitor: populatedVisitor,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createVisitor,
  getTodayVisitors,
  getWaitingVisitors,
  getMyFlatVisitors,
  approveVisitor,
  rejectVisitor,
  markVisitorEntry,
  markVisitorExit,
}
