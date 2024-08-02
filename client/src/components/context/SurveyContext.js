import React, { createContext, useContext, useState } from 'react'
import backendApis from '../../utils/backendApis'

const SurveyContext = createContext()

export const useSurvey = () => {
  return useContext(SurveyContext)
}

export const SurveyProvider = ({ children }) => {
  const [latestSurvey, setLatestSurvey] = useState(null)

  const createAndSaveSurvey = async (surveyData) => {
    try {
      // 백엔드로 설문조사 데이터를 보내 저장하고, ObjectId를 반환받음
      const response = await backendApis.saveSurvey(surveyData)

      if (response && response.id) {
        setLatestSurvey({ id: response.id, ...surveyData })
        return response.id
      } else {
        throw new Error('Failed to save survey')
      }
    } catch (error) {
      console.error('설문조사 저장 오류:', error)
      throw error
    }
  }

  return (
    <SurveyContext.Provider value={{ latestSurvey, createAndSaveSurvey }}>
      {children}
    </SurveyContext.Provider>
  )
}
