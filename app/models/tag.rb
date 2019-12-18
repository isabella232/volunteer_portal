class Tag < ApplicationRecord
  has_many :event_tags # , dependent: :nullify
  has_many :events, through: :event_tags
  
  has_many :individual_event_tags # , dependent: :nullify
  has_many :individual_events, through: :individual_event_tags # , dependent: :nullify
end
