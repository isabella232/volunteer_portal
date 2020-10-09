import React, { useContext, useState, useEffect } from 'react'
import * as R from 'ramda'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { addDays } from 'date-fns'
import styled from 'styled-components'
import { useLazyQuery } from '@apollo/react-hooks'

import {
  Dropdown,
  Field,
  Select
} from '@zendeskgarden/react-dropdowns';
import { Field as FormField, Label as FormLabel, Input } from '@zendeskgarden/react-forms'
import { Datepicker } from '@zendeskgarden/react-datepickers'
import { Button } from '@zendeskgarden/react-buttons'
import { Well, Title, Paragraph } from '@zendeskgarden/react-notifications';

import UserReporting from './User'
import EventTypeReporting from './EventType'
import UserReportingQuery from './queries/userReportingQuery.gql'
import OrganizedEventTypeReportingQuery from './queries/organizedEventTypeReportingQuery.gql'
import IndividualEventTypeReportingQuery from './queries/individualEventTypeReportingQuery.gql'
import { FilterContext, officeFilterValueLens } from '/context'
import OfficeFilter from '../../../components/OfficeFilter'
import { Box, FlexBox } from '../../../components/StyleFoundation'
import RenderMenu from './RenderMenu'


const ToolbarHeader = styled(FlexBox)`
  border-bottom: 1px solid ${({theme}) => theme.palette.grey["200"]};
  padding-bottom: ${({ theme }) => theme.space.md};
  & > * {
    align-self: flex-end;
    padding: 4px;
  }
`

const CombinedInput = styled(Input)`
  border-radius: ${(props) => props.left ? "4px 0 0 4px" : props.right ? "0 4px 4px 0" : "inherit"};
  ${(props) => props.left && "border-right: 0px"};
`

const Prompt = styled.h3`
  text-align: center;
  margin: 32px;
`

const DropdownField = styled(Field)`
  min-width: 200px;
`

const defaultStartDate = moment().startOf('year')
const defaultEndDate = moment().valueOf() // Now in Unix millisecond timestamp
const today = new Date()
const lastFortnight = addDays(today, -14)
const initialRange = {
  start: lastFortnight,
  end: today,
}

const formatOrDefaultStartDate = filterValue => Number(moment(filterValue || defaultStartDate).format('X'))
const formatOrDefaultEndDate = filterValue => Number(moment(filterValue || defaultEndDate).format('X'))

const setUserOctectStream = (data, setOctectStream) => {
  const headers = 'Name,Email,Office,Minutes\n'
  const csv = R.reduce((acc, row) => acc + `${row.name},${row.email},${row.office.name},${row.minutes}\n`, headers, data)
  const octetStream = encodeURIComponent(csv)
  setOctectStream(octetStream)
}

const setEventTypeOctectStream = (data, setOctectStream) => {
  const headers = 'Id,Event Type,Minutes\n'
  const csv = R.reduce((acc, row) => acc + `${row.id},${row.title},${row.minutes}\n`, headers, data)
  const octetStream = encodeURIComponent(csv)
  setOctectStream(octetStream)
}

const ReportingPage = () => {
  
  const { t, i18n } = useTranslation()
  
  const [ report, setReport ] = useState(null) // null | 'user' | `other report keys`
  const [ dropDownIsOpen, setDropDownIsOpen ] = useState(false)
  const [ dropDownTempSelectedItem, setDropDownTempSelectedItem ] = useState(false)
  const [ octetStream, setOctectStream ] = useState(null)

  const [ dateRange, setDateRange ] = useState(initialRange)
  const { filters } = useContext(FilterContext)

  const [ getUsers, { loading: userLoading, data: userData } ] = useLazyQuery(UserReportingQuery)
  const [ getOrganizedEventTypes, { loading: organizedEventTypeLoading, data: organizedEventTypeData } ] = useLazyQuery(OrganizedEventTypeReportingQuery)
  const [ getIndividualEventTypes, { loading: individualEventTypeLoading, data: individualEventTypeData } ] = useLazyQuery(IndividualEventTypeReportingQuery)

  // Updates data
  useEffect(() => {
    const baseVariables = {
      after: formatOrDefaultStartDate(dateRange.start),
      before: formatOrDefaultEndDate(dateRange.end),
      officeId: R.view(officeFilterValueLens, filters),
    }
    switch (report) {
      case 'user':
        getUsers({ variables: baseVariables })
        break;
      case 'organizedEventType':
        getOrganizedEventTypes({ variables: baseVariables })
        break;
      case 'individualEventType':
        getIndividualEventTypes({ variables: baseVariables })
        break;
      default:
        break;
    }
  }, [ report, dateRange.start, dateRange.end, filters ])

  // Updates export button
  useEffect(() => {
    switch (report) {
      case 'user':
        userData && setUserOctectStream(R.propOr([], 'users', userData), setOctectStream)
        break;
      case 'organizedEventType':
        organizedEventTypeData && setEventTypeOctectStream(R.propOr([], 'eventTypeOrganizedReport', organizedEventTypeData), setOctectStream)
        break;
      case 'individualEventType':
        individualEventTypeData && setEventTypeOctectStream(R.propOr([], 'eventTypeIndividualReport', individualEventTypeData), setOctectStream)
        break;
      default:
        break;
    }
  }, [ userData, organizedEventTypeData, individualEventTypeData ])

  const changeStartDate = date => setDateRange(R.set(R.lensProp('start'), date))
  const changeEndDate = date => setDateRange(R.set(R.lensProp('end'), date))

  const reportKeyTitleMap = {
    user: t('volunteer_portal.admin.tab.reporting.dropdown.users'),
    organizedEventType: `${t('volunteer_portal.admin.tab.reporting.dropdown.organized_events')} / ${t('volunteer_portal.admin.tab.reporting.dropdown.nested.event_type')}`,
    individualEventType: `${t('volunteer_portal.admin.tab.reporting.dropdown.individual_events')} / ${t('volunteer_portal.admin.tab.reporting.dropdown.nested.event_type')}`
  }

  const handleDropdownStateChange = (changes, stateAndHelpers) => {
    if (Object.prototype.hasOwnProperty.call(changes, 'isOpen')) {
      const nextIsOpen =
        changes.selectedItem === 'base' ||
        changes.selectedItem === 'organized' ||
        changes.selectedItem === 'individual' ||
        changes.isOpen
      setDropDownIsOpen(nextIsOpen)
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'selectedItem')) {
      const nextSelectedItem = changes.selectedItem
      if (nextSelectedItem === 'base') {
        switch (dropDownTempSelectedItem) {
          case 'organized':
            stateAndHelpers.setHighlightedIndex(1)
            break
          case 'individual':
            stateAndHelpers.setHighlightedIndex(2)
            break
        }
      }
      setDropDownTempSelectedItem(nextSelectedItem)
    }
  }

  const handleDropdownOnSelect = item => {
    if (item !== 'base' && item !== 'individual'  && item !== 'organized') {
      setReport(item)
    }
  }

  return (
    <FlexBox justifyContent="space-around">
      <Box width="100%">
        <ToolbarHeader justifyContent="space-between">
          <Dropdown
              isOpen={dropDownIsOpen}
              onSelect={handleDropdownOnSelect}
              onStateChange={handleDropdownStateChange}
            >
            <DropdownField>
              <FormLabel>{t('volunteer_portal.admin.tab.reporting.select_label')}</FormLabel>
              <Select>
                {
                  report === null ? t('volunteer_portal.admin.tab.reporting.dropdown.none') : reportKeyTitleMap[report]
                }
              </Select>
            </DropdownField>
            <RenderMenu dropDownTempSelectedItem={dropDownTempSelectedItem} />
          </Dropdown>
          <FormField>
            <FormLabel>{t('volunteer_portal.admin.tab.reporting.filter')}</FormLabel>
            <Box mt="8px">
              {/* TODO: Local office filter? */}
              <OfficeFilter/>
            </Box>
          </FormField>
          <FlexBox>
            <FormField>
                <FormLabel>{t('volunteer_portal.admin.tab.reporting.from')}</FormLabel>
                <Datepicker value={dateRange.start} onChange={changeStartDate} maxValue={today} locale={i18n.language}>
                  <CombinedInput left bare />
                </Datepicker>
            </FormField>
            <FormField>
                <FormLabel>{t('volunteer_portal.admin.tab.reporting.to')}</FormLabel>
                <Datepicker value={dateRange.end} onChange={changeEndDate} maxValue={today} locale={i18n.language}>
                  <CombinedInput right bare />
                </Datepicker>
            </FormField>
          </FlexBox>
          <a href={octetStream && `data:application/octet-stream;filename=export.csv,${octetStream}`} download="export.csv">
            <Button disabled={!octetStream}>{t('volunteer_portal.admin.tab.reporting.exportascsv')}</Button>
          </a>
        </ToolbarHeader>
        {
          report === 'user' ?
            <UserReporting
              users={R.propOr([], 'users', userData)}
              loading={userLoading}
            />
          :
          report === 'organizedEventType' ?
            <EventTypeReporting
              eventTypes={R.propOr([], 'eventTypeOrganizedReport', organizedEventTypeData)}
              loading={userLoading}
            />
          :
          report === 'individualEventType' ?
            <EventTypeReporting
              eventTypes={R.propOr([], 'eventTypeIndividualReport', individualEventTypeData)}
              loading={userLoading}
            />
          :
          <Box mt="16px">
            <Well>
              <Title>{t('volunteer_portal.admin.tab.reporting.select_report')}</Title>
              <Paragraph>
                {t('volunteer_portal.admin.tab.reporting.select_report_prompt')}
              </Paragraph>
            </Well>
          </Box>

        }
      </Box>
    </FlexBox>
  )
}

export default ReportingPage
