import { useEffect, useState } from 'react'
import { structureApi } from '../../services/api'
import './resident.css'

export default function MyFlat() {
  const [flat, setFlat] = useState(null)
  const [error, setError] = useState('')

  const user = JSON.parse(
    localStorage.getItem('sociohub_user') || '{}'
  )

  useEffect(() => {
    structureApi
      .getMyFlat()
      .then(({ flat: currentFlat }) => {
        setFlat(currentFlat)
      })
      .catch((requestError) => {
        setError(requestError.message)
      })
  }, [])

  const roleLabel =
    user.role === 'OWNER'
      ? 'Owner'
      : user.role === 'TENANT'
        ? 'Tenant'
        : user.role || 'Resident'

  return (
    <section className="resident-page">

      <p className="page-kicker">
        Your property
      </p>

      <h1>
        My flat
      </h1>

      <p className="resident-intro">
        View your flat details and the residents associated
        with this property.
      </p>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      {flat && (
        <>
          {/* Flat overview */}

          <div className="detail-panel">

            <div className="property-title">
              <strong>
                {flat.wingId?.name}-{flat.number}
              </strong>

              <span>
                {flat.type || 'Home'}
              </span>
            </div>


            {/* Flat details */}

            <h3>
              Flat Details
            </h3>

            <div className="property-grid">

              <div>
                <span>Wing</span>
                <strong>
                  {flat.wingId?.name || '-'}
                </strong>
              </div>

              <div>
                <span>Flat Number</span>
                <strong>
                  {flat.number || '-'}
                </strong>
              </div>

              <div>
                <span>Floor</span>
                <strong>
                  {flat.floor !== undefined
                    ? `${flat.floor}${flat.floor === 1
                        ? 'st'
                        : flat.floor === 2
                          ? 'nd'
                          : flat.floor === 3
                            ? 'rd'
                            : 'th'} Floor`
                    : '-'}
                </strong>
              </div>

              <div>
                <span>Type</span>
                <strong>
                  {flat.type || '-'}
                </strong>
              </div>

              <div>
                <span>Area</span>
                <strong>
                  {flat.area
                    ? `${flat.area} sq. ft.`
                    : '-'}
                </strong>
              </div>

            </div>


            {/* People associated with flat */}

            <h3>
              People in this Flat
            </h3>

            <div className="property-grid">

              <div>
                <span>Owner</span>
                <strong>
                  {flat.ownerId?.name || 'Not listed'}
                </strong>
              </div>

              <div>
                <span>Tenant</span>
                <strong>
                  {flat.tenantId?.name || 'None'}
                </strong>
              </div>

            </div>


            {/* Current user's relationship */}
<div className="relationship-box">
  <span>
    Your relationship with this flat
  </span>

  <strong>
    {roleLabel}
  </strong>
</div>

          </div>
        </>
      )}

      {!flat && !error && (
        <div className="detail-panel">
          <p className="empty-state">
            Your flat has not been assigned yet.
          </p>
        </div>
      )}

    </section>
  )
}