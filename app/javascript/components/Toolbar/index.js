import React from 'react'

import * as R from 'ramda'
import { navigate } from 'react-big-calendar/lib/utils/constants'
import { withTranslation } from 'react-i18next'

import ShowFilter from 'components/ShowFilter'
import EventFilter from 'components/EventFilter'
import OfficeFilter from 'components/OfficeFilter'
import FilterGroup from 'components/FilterGroup'

import s from './main.css'

const translations = R.flip(R.mapObjIndexed)({
  month: 'volunteer_portal.calendar.bigcalendar.month',
  week: 'volunteer_portal.calendar.bigcalendar.week',
  work_week: 'volunteer_portal.calendar.bigcalendar.work_week',
  day: 'volunteer_portal.calendar.bigcalendar.day',
  agenda: 'volunteer_portal.calendar.bigcalendar.agenda',
  today: 'volunteer_portal.dashboard.layoutdatetab.today',
  previous: 'volunteer_portal.dashboard.layoutdatetab.previous',
  after: 'volunteer_portal.dashboard.layoutdatetab.after',
})

const Toolbar = ({ label, view, views, onNavigate, onViewChange, t }) => {
  const text = translations(t)

  return (
    <div className={s.toolbar}>
      <div className={s.navBar}>
        <button className={s.todayBtn} type="button" onClick={() => onNavigate(navigate.TODAY)}>
          {text.today}
        </button>
        <button className={s.btn} type="button" onClick={() => onNavigate(navigate.PREVIOUS)}>
          {text.previous}
        </button>
        <span className={s.label}>{label}</span>
        <button className={s.btn} type="button" onClick={() => onNavigate(navigate.NEXT)}>
          {text.after}
        </button>
      </div>
      <div className={s.filterBar}>
        <FilterGroup>
          <div>
            <ShowFilter />
          </div>
          <div>
            <EventFilter />
          </div>
          <div>
            <OfficeFilter />
          </div>
        </FilterGroup>
        <div>
          {views.map(viewName => (
            <button
              key={viewName}
              className={view === viewName ? `${s.btn} ${s.activeBtn}` : s.btn}
              onClick={() => onViewChange(viewName)}
            >
              {R.prop(viewName, text)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default withTranslation()(Toolbar)
