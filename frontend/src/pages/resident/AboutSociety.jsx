import { useEffect, useState } from 'react'
import { structureApi } from '../../services/api'
import './about-society.css'

const year = (value) => value ? new Date(value).getFullYear() : null
const formatCount = (value) => Number(value || 0).toLocaleString('en-IN')
const defaultExternalAmenities = ['Sit Out Area', 'Security 24 x 7', 'Banquet Hall', 'Terrace Garden', 'Kids Play Area', 'Gymnasium', 'Electrical Vehicle Charging', 'Yoga', '24 x 7 Water Supply']
const defaultInternalFeatures = ['Vitrified Tiles for Living, Dining, Kitchen & Bedrooms', 'Vitrified Tiles for Bathroom Flooring & Dado', 'Wash Basin Counters', `Vitrified Tile Dado 2'0" high above Kitchen platform`, 'Kitchen platform with SS sink & Drain board']

function DetailIcon({ type }) {
  const shapes = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M10 20v-6h4v6"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5.2a3 3 0 0 1 0 5.6M18 14a5 5 0 0 1 3 4.6V20"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    call: <path d="M6.6 3.5 9 3l2 5-2.2 1.7a14 14 0 0 0 5 5l1.7-2.2 5 2 .5 2.5a3 3 0 0 1-3.3 3.5C10.5 19 5 13.5 4 6.8a3 3 0 0 1 2.6-3.3Z"/>,
  }
  return <svg className="society-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[type]}</svg>
}

export default function AboutSociety() {
  const [society, setSociety] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { structureApi.getMySociety().then(({ society: item }) => setSociety(item)).catch((requestError) => setError(requestError.message)) }, [])
  if (error) return <section className="about-society-page"><div className="about-message" role="alert">{error}</div></section>
  if (!society) return <section className="about-society-page"><div className="about-message">Loading society information…</div></section>

  const configuredExternalAmenities = Array.isArray(society.externalAmenities) && society.externalAmenities.length ? society.externalAmenities : defaultExternalAmenities
  const legacyAmenities = Array.isArray(society.amenities) ? society.amenities : []
  const externalAmenities = [...new Set([...configuredExternalAmenities, ...legacyAmenities].filter(Boolean))]
  const internalFeatures = Array.isArray(society.internalFeatures) && society.internalFeatures.length ? society.internalFeatures : defaultInternalFeatures
  const samplePhotos = Array.isArray(society.sampleFlatPhotos) ? society.sampleFlatPhotos.filter(Boolean) : []
  const established = year(society.establishedAt)
  const facts = [
    { icon: 'home', value: society.totalWings ? formatCount(society.totalWings) : '—', label: 'Wings' },
    { icon: 'people', value: society.totalFlats ? formatCount(society.totalFlats) : '—', label: 'Homes' },
    { icon: 'calendar', value: established || '—', label: established ? 'Established' : 'Community' },
    { icon: 'pin', value: society.address?.split(',')[0] || '—', label: 'Location' },
  ]
  const faqs = [
    ['Where is the society located?', society.address],
    ['How many homes are part of the society?', society.totalFlats ? `${formatCount(society.totalFlats)} homes across ${formatCount(society.totalWings)} wings.` : 'Contact the society management team for current community details.'],
    ['What amenities are available?', [...externalAmenities, ...internalFeatures].join(', ')],
    ['How can I contact society management?', [society.contactEmail, society.contactPhone].filter(Boolean).join(' · ') || 'Contact details will be added here by society management.'],
  ]

  return <section className="about-society-page">
    <nav className="society-about-nav" aria-label="About society sections">
      <a className="society-about-brand" href="#society-about">{society.name}</a>
      <div className="society-about-nav-links"><a href="#society-about">About</a><a href="#society-overview">Overview</a><a href="#society-sample-heading">Photos</a><a href="#society-amenities">Amenities</a><a href="#society-location">Location</a><a href="#society-faq">FAQ</a></div>
    </nav>

    <header className="society-about-intro" id="society-about">
      <p className="society-about-eyebrow">WELCOME TO YOUR COMMUNITY</p>
      <h1>About {society.name}</h1>
      <div className="society-intro-rule" />
      <p><strong>{society.name}</strong> is a residential community located at <strong>{society.address}</strong>{established ? <> and established in <strong>{established}</strong></> : null}. {society.totalWings ? <>The community has <strong>{formatCount(society.totalWings)} wings</strong>{society.totalFlats ? <> and <strong>{formatCount(society.totalFlats)} homes</strong></> : null}.</> : null}</p>
      {society.about?.trim() && <p className="society-about-story">{society.about.trim()}</p>}
    </header>

    <section className="society-overview-section" id="society-overview">
      <div className="society-section-heading"><p className="society-about-eyebrow">AT A GLANCE</p><h2>Society overview</h2><p>A few details about the place you call home.</p></div>
      <div className="society-overview-grid">{facts.map((fact) => <article className="society-overview-item" key={fact.label}><span className="society-icon-wrap"><DetailIcon type={fact.icon}/></span><strong>{fact.value}</strong><span>{fact.label}</span></article>)}</div>
    </section>

    <section className="society-sample-section" aria-labelledby="society-sample-heading"><div className="society-section-heading"><p className="society-about-eyebrow">TAKE A CLOSER LOOK</p><h2 id="society-sample-heading">Sample Flat Photos</h2><p>A glimpse of the spaces and finishes inside the homes.</p></div>{samplePhotos.length ? <div className="society-photo-gallery">{samplePhotos.map((photo, index) => <figure className="society-photo-card" key={`${photo}-${index}`}><img src={photo} alt={`Sample flat view ${index + 1}`} loading="lazy"/><figcaption>{index === 0 ? 'Sample flat' : `Interior view ${index + 1}`}</figcaption></figure>)}</div> : <div className="society-photo-empty"><span className="society-photo-placeholder" aria-hidden="true"><i/><i/><i/></span><div><strong>Sample flat photos coming soon</strong><p>Society management can add photos in Society details.</p></div></div>}</section>

    <section className="society-amenities-section" id="society-amenities"><div className="society-section-heading"><p className="society-about-eyebrow">COMMUNITY SPACES</p><h2>Amenities for everyday living</h2><p>Shared facilities and features available to residents.</p></div><div className="society-feature-columns"><article className="society-feature-panel"><h3>External Amenities</h3><ul>{externalAmenities.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article><article className="society-feature-panel"><h3>Internal Features</h3><ul>{internalFeatures.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div></section>

    <section className="society-location-section" id="society-location">
      <div><p className="society-about-eyebrow">FIND YOUR WAY</p><h2>Our location</h2><p className="society-location-address"><DetailIcon type="pin"/>{society.address}</p></div>
      <a className="society-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(society.address)}`} target="_blank" rel="noreferrer">View on map <span aria-hidden="true">↗</span></a>
    </section>

    <section className="society-faq-section" id="society-faq"><div className="society-section-heading"><p className="society-about-eyebrow">GOOD TO KNOW</p><h2>Frequently asked questions</h2></div><div className="society-faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

    {(society.contactEmail || society.contactPhone) && <footer className="society-about-footer"><span>Need more information?</span><div>{society.contactEmail && <a href={`mailto:${society.contactEmail}`}><DetailIcon type="call"/>{society.contactEmail}</a>}{society.contactPhone && <a href={`tel:${society.contactPhone}`}><DetailIcon type="call"/>{society.contactPhone}</a>}</div></footer>}
  </section>
}
