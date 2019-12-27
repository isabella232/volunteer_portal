import React from 'react'
import Geosuggest from 'react-geosuggest'

import s from './main.css'

const LocationField = ({ input: { value, onChange } }) => (
  <Geosuggest
    autoComplete="off"
    inputClassName={s.field}
    suggestsClassName={s.autocompleteList}
    initialValue={value}
    onChange={onChange}
    onSuggestSelect={s => {
      try {
        onChange(s.gmaps.formatted_address)
      } catch {
        onChange('')
      }
    }}
  />
)

export default LocationField
