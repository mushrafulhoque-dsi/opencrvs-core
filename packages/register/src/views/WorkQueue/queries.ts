import gql from 'graphql-tag'

export const COUNT_REGISTRATION_QUERY = gql`
  query data($locationIds: [String]) {
    countEventRegistrations(locationIds: $locationIds) {
      declared
      rejected
    }
  }
`
export const FETCH_REGISTRATIONS_QUERY = gql`
  query data($status: String, $locationIds: [String], $count: Int, $skip: Int) {
    listEventRegistrations(
      status: $status
      locationIds: $locationIds
      count: $count
      skip: $skip
    ) {
      totalItems
      results {
        id
        registration {
          type
          trackingId
          status {
            timestamp
          }
        }
        createdAt
        ... on BirthRegistration {
          child {
            name {
              use
              firstNames
              familyName
            }
            birthDate
          }
        }
        ... on DeathRegistration {
          deceased {
            name {
              use
              firstNames
              familyName
            }
            deceased {
              deathDate
            }
          }
        }
      }
    }
  }
`
