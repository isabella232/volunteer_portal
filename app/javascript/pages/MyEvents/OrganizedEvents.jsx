import React from 'react'
import moment from 'moment'
import { I18nReactTable } from '../../lib/i18n'

import { NoEventsMessage, EventsTable } from './StyledComponents'

import { useTranslation } from 'react-i18next'

const organizedEventsColumns = (t) => [
  {
    id: 'event',
    Header: t('volunteer_portal.admin.tab.user.myevents.organizedevents.events'),
    accessor: 'title',
  },
  {
    id: 'organization',
    Header: t('volunteer_portal.admin.tab.user.myevents.organizedevents.organization'),
    accessor: 'organization.name',
  },
  {
    id: 'date',
    Header: t('volunteer_portal.admin.tab.user.myevents.organizedevents.date'),
    Cell: props => <span>{moment(props.value).format('LL')}</span>,
    accessor: 'startsAt',
  },
  {
    id: 'duration',
    Header: t('volunteer_portal.admin.tab.user.myevents.organizedevents.duration'),
    accessor: 'duration',
  },
  {
    id: 'type',
    Header: t('volunteer_portal.admin.tab.user.myevents.organizedevents.type'),
    accessor: 'eventType.title',
  },
  {
    id: 'location',
    Header: t('volunteer_portal.admin.tab.user.myevents.organizedevents.location'),
    accessor: 'location',
  },
]

const OrganizedEvents = ({ currentUser: { signups } }) => {
  const { t } = useTranslation() 
  const noOrganizedEventsMessage = (
    <NoEventsMessage>
      {t('volunteer_portal.admin.tab.user.myevents.organizedevents.noevents')}
    </NoEventsMessage>
  )
  return (
    <EventsTable>
      <h1>{t('volunteer_portal.admin.tab.user.myevents.organizedevents')}</h1>
      <h4>{t('volunteer_portal.admin.tab.user.myevents.organizedevents.description')}</h4>
      {signups.length === 0 ? (
        noOrganizedEventsMessage
      ) : (
        <I18nReactTable
          NoDataComponent={() => null}
          data={signups.map(signup => signup.event)}
          columns={organizedEventsColumns(t)}
          defaultPageSize={10}
          defaultSorted={[{ id: 'date', desc: true }]}
          minRows={0}
        />
      )}
    </EventsTable>
  )
}

export default OrganizedEvents

