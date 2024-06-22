import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BackendApis from '../../utils/backendApis'

const TestSummary = () => {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { surveyId } = useParams()

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summaryData = await BackendApis.getSurveySummary(surveyId)
        if (summaryData) {
          setSummary(summaryData)
        } else {
          setError('Failed to fetch summary data.')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [surveyId])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!summary) {
    return <div>No summary data available.</div>
  }

  return (
    <div>
      <h1>Survey Summary</h1>
      <div>
        <p>Views: {summary.views}</p>
        <p>Start Count: {summary.startCount}</p>
        <p>Completed Count: {summary.completedCount}</p>
        <p>Dropout Count: {summary.dropoutCount}</p>
        <p>Avg Response Time: {summary.avgResponseTime}</p>
        <p>Exposure Start Ratio: {summary.exposureStartRatio}%</p>
        <p>Exposure Completed Ratio: {summary.exposureCompletedRatio}%</p>
        <p>Exposure Dropout Ratio: {summary.exposureDropoutRatio}%</p>
      </div>
    </div>
  )
}

export default TestSummary
