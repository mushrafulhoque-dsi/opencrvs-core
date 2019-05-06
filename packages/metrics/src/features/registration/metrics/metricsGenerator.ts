import { readPoints } from 'src/influxdb/client'
import {
  ageIntervals,
  calculateInterval,
  generateEmptyBirthKeyFigure,
  fetchEstimateByLocation,
  IPoint,
  LABEL_FOMRAT
} from 'src/features/registration/metrics/utils'
import * as moment from 'moment'
import { IAuthHeader } from '..'
import {
  MALE,
  FEMALE,
  WITHIN_45_DAYS,
  WITHIN_45_DAYS_TO_1_YEAR,
  WITHIN_1_YEAR
} from './constants'

interface IGroupedByGender {
  total: number
  gender: string
}

export type BirthKeyFigures = {
  label: string
  value: number
  total: number
  estimate: number
  categoricalData: BirthKeyFiguresData[]
}

type BirthKeyFiguresData = {
  name: string
  value: number
}

export type Estimation = {
  crudRate: number
  population: number
}

export async function regByAge(timeStart: string, timeEnd: string) {
  let metricsData: any[] = []
  for (let i = 0; i < ageIntervals.length; i++) {
    const points = await readPoints(
      `SELECT COUNT(age_in_days) FROM birth_reg WHERE time > ${timeStart} AND time <= ${timeEnd} AND age_in_days > ${
        ageIntervals[i].minAgeInDays
      } AND age_in_days <= ${ageIntervals[i].maxAgeInDays}`
    )

    metricsData.push({
      label: ageIntervals[i].title,
      value: (points && points.length > 0 && points[0].count) || 0
    })
  }

  return metricsData
}

export const regWithin45d = async (timeStart: string, timeEnd: string) => {
  const interval = calculateInterval(timeStart, timeEnd)
  const points = await readPoints(
    `
      SELECT COUNT(age_in_days) AS count
        FROM birth_reg 
      WHERE time >= ${timeStart} AND time <= ${timeEnd} 
        GROUP BY time(${interval})
    `
  )

  const total =
    (points &&
      points.reduce((total: IPoint, point: IPoint) => ({
        count: total.count + point.count
      }))) ||
    0
  const label = LABEL_FOMRAT[interval]

  return (
    (points &&
      points.map((point: IPoint) => ({
        label: moment(point.time).format(label),
        value: point.count,
        totalEstimate: total.count
      }))) ||
    []
  )
}

export async function fetchKeyFigures(
  timeStart: string,
  timeEnd: string,
  locationId: string,
  authHeader: IAuthHeader
) {
  const estimations = await fetchEstimateByLocation(
    locationId,
    authHeader,
    // TODO: need to adjust this when date range is properly introduced
    new Date().getFullYear()
  )

  const keyFigures: BirthKeyFigures[] = []

  /* Populating < 45D data */
  const within45DaysData: IGroupedByGender[] = await readPoints(
    `SELECT COUNT(age_in_days) AS total
      FROM birth_reg
    WHERE time >= ${timeStart}
      AND time <= ${timeEnd}      
      AND ( locationLevel2 = 'Location/${locationId}' 
          OR locationLevel3 = 'Location/${locationId}'
          OR locationLevel4 = 'Location/${locationId}' 
          OR locationLevel5 = 'Location/${locationId}' )
      AND age_in_days <= 45
    GROUP BY gender`
  )
  keyFigures.push(
    populateBirthKeyFigurePoint(WITHIN_45_DAYS, within45DaysData, estimations)
  )
  /* Populating > 45D and < 365D data */
  const within1YearData: IGroupedByGender[] = await readPoints(
    `SELECT COUNT(age_in_days) AS total
      FROM birth_reg
    WHERE time >= ${timeStart}
      AND time <= ${timeEnd}      
      AND ( locationLevel2 = 'Location/${locationId}' 
          OR locationLevel3 = 'Location/${locationId}'
          OR locationLevel4 = 'Location/${locationId}' 
          OR locationLevel5 = 'Location/${locationId}' )
      AND age_in_days > 45
      AND age_in_days <= 365      
    GROUP BY gender`
  )
  keyFigures.push(
    populateBirthKeyFigurePoint(
      WITHIN_45_DAYS_TO_1_YEAR,
      within1YearData,
      estimations
    )
  )
  /* Populating < 365D data */
  let fullData: IGroupedByGender[] = []
  if (within45DaysData) {
    fullData = fullData.concat(within45DaysData)
  }
  if (within1YearData) {
    fullData = fullData.concat(within1YearData)
  }
  keyFigures.push(
    populateBirthKeyFigurePoint(WITHIN_1_YEAR, fullData, estimations)
  )
  return keyFigures
}

const populateBirthKeyFigurePoint = (
  figureLabel: string,
  groupedByGenderData: IGroupedByGender[],
  estimations: Estimation
): BirthKeyFigures => {
  if (!groupedByGenderData || groupedByGenderData === []) {
    return generateEmptyBirthKeyFigure(figureLabel, estimations.population)
  }
  let percentage = 0
  let totalMale = 0
  let totalFemale = 0

  groupedByGenderData.forEach(data => {
    if (data.gender === FEMALE) {
      totalFemale = data.total
    } else if (data.gender === MALE) {
      totalMale = data.total
    }
  })
  if (totalMale + totalFemale === 0) {
    return generateEmptyBirthKeyFigure(figureLabel, estimations.population)
  }

  /* TODO: need to implement different percentage calculation logic 
     based on different date range here */
  percentage = Math.round(
    ((totalMale + totalFemale) /
      ((estimations.crudRate * estimations.population) / 1000)) *
      100
  )

  return {
    label: figureLabel,
    value: percentage,
    total: totalMale + totalFemale,
    estimate: estimations.population,
    categoricalData: [
      {
        name: FEMALE,
        value: totalFemale
      },
      {
        name: MALE,
        value: totalMale
      }
    ]
  }
}
