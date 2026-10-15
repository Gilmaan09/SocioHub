const WatchmanAttendance = require('../models/WatchmanAttendance')
const {
  isValidId,
} = require('../utils/structureControllerUtils')


/*
  Watchman starts duty
*/
async function startDuty(
  request,
  response,
  next
) {
  try {
    const watchmanId = request.user._id
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message:
          'Watchman is not assigned to a society',
      })
    }

    /*
      Check if the Watchman already has
      an active duty session.
    */
    const activeDuty =
      await WatchmanAttendance.findOne({
        watchmanId,
        societyId,
        status: 'ON_DUTY',
        dutyEnd: null,
      })

    if (activeDuty) {
      return response.status(409).json({
        message:
          'You are already on duty',
        attendance: activeDuty,
      })
    }

    const attendance =
      await WatchmanAttendance.create({
        watchmanId,
        societyId,
        dutyStart: new Date(),
        status: 'ON_DUTY',
      })

    return response.status(201).json({
      message:
        'Duty started successfully',
      attendance,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Watchman ends duty
*/
async function endDuty(
  request,
  response,
  next
) {
  try {
    const watchmanId = request.user._id
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message:
          'Watchman is not assigned to a society',
      })
    }

    const attendance =
      await WatchmanAttendance.findOne({
        watchmanId,
        societyId,
        status: 'ON_DUTY',
        dutyEnd: null,
      }).sort({
        dutyStart: -1,
      })

    if (!attendance) {
      return response.status(404).json({
        message:
          'No active duty session found',
      })
    }

    attendance.dutyEnd = new Date()
    attendance.status = 'COMPLETED'

    await attendance.save()

    return response.json({
      message:
        'Duty ended successfully',
      attendance,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Get current Watchman's duty status
*/
async function getCurrentDuty(
  request,
  response,
  next
) {
  try {
    const watchmanId = request.user._id
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message:
          'Watchman is not assigned to a society',
      })
    }

    const attendance =
      await WatchmanAttendance.findOne({
        watchmanId,
        societyId,
        status: 'ON_DUTY',
        dutyEnd: null,
      }).sort({
        dutyStart: -1,
      })

    return response.json({
      onDuty: Boolean(attendance),
      attendance: attendance || null,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Get Watchman's own attendance history
*/
async function getMyAttendance(
  request,
  response,
  next
) {
  try {
    const watchmanId = request.user._id
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message:
          'Watchman is not assigned to a society',
      })
    }

    const attendance =
      await WatchmanAttendance.find({
        watchmanId,
        societyId,
      })
        .sort({
          dutyStart: -1,
        })

    return response.json({
      attendance,
    })
  } catch (error) {
    return next(error)
  }
}


/*
  Admin gets attendance history
*/
async function getSocietyAttendance(
  request,
  response,
  next
) {
  try {
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message:
          'Admin is not assigned to a society',
      })
    }

    const filter = {
      societyId,
    }

    /*
      Optional Watchman filter
    */
    if (
      request.query.watchmanId
    ) {
      if (
        !isValidId(
          request.query.watchmanId
        )
      ) {
        return response.status(400).json({
          message:
            'Invalid watchman ID',
        })
      }

      filter.watchmanId =
        request.query.watchmanId
    }

    const attendance =
      await WatchmanAttendance.find(
        filter
      )
        .populate(
          'watchmanId',
          'name phone email'
        )
        .sort({
          dutyStart: -1,
        })

    return response.json({
      attendance,
    })
  } catch (error) {
    return next(error)
  }
}


module.exports = {
  startDuty,
  endDuty,
  getCurrentDuty,
  getMyAttendance,
  getSocietyAttendance,
}