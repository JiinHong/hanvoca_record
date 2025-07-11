'use client'

import { useState, useEffect, useMemo } from 'react'

interface VocabFeedbackLog {
  id: string
  sentence: string
  guess: string
  answer: string
  feedback: string
  created_at: string
  anon_id: string
}

interface BetaWaitlist {
  id: string
  email: string
  created_at: string
}

interface ApiResponse {
  vocab_feedback_log: VocabFeedbackLog[]
  beta_waitlist: BetaWaitlist[]
}

type TabType = 'all' | 'user' | 'sentence' | 'waitlist'

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [expandedSentences, setExpandedSentences] = useState<{ [sentence: string]: boolean }>({})

  // 사용자 ID 매핑
  const userIdMap = useMemo(() => {
    const ids = Array.from(new Set((data?.vocab_feedback_log || []).map(item => item.anon_id)))
    const map: { [anon_id: string]: string } = {}
    ids.forEach((id, idx) => {
      map[id] = `사용자${idx + 1}`
    })
    return map
  }, [data])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('https://whlfxkvrmdzgscnlklmn.supabase.co/functions/v1/get_all_data', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobGZ4a3ZybWR6Z3NjbmxrbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTQwNjUsImV4cCI6MjA2MTU3MDA2NX0.R6aI0I3XLpfr7WEGuyYdwvULgt9HYszYNIx2R6P6tLI',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 가져오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFeedbackColor = (feedback: string) => {
    if (feedback.includes('correct') || feedback.includes('Well done') || feedback.includes('Great job')) {
      return 'text-green-600 bg-green-50'
    } else if (feedback.includes('incorrect') || feedback.includes('wrong')) {
      return 'text-red-600 bg-red-50'
    }
    return 'text-blue-600 bg-blue-50'
  }

  // 사용자별 그룹화
  const groupByUser = (logs: VocabFeedbackLog[]) => {
    const map: { [anon_id: string]: VocabFeedbackLog[] } = {}
    logs.forEach(log => {
      if (!map[log.anon_id]) map[log.anon_id] = []
      map[log.anon_id].push(log)
    })
    return map
  }

  // 문장별 그룹화
  const groupBySentence = (logs: VocabFeedbackLog[]) => {
    const map: { [sentence: string]: VocabFeedbackLog[] } = {}
    logs.forEach(log => {
      if (!map[log.sentence]) map[log.sentence] = []
      map[log.sentence].push(log)
    })
    return map
  }

  // 아코디언 토글
  const toggleExpand = (key: string) => {
    setExpanded(expanded === key ? null : key)
  }

  // 정렬 함수
  const sortByTime = <T extends { created_at: string }>(arr: T[]) => {
    return [...arr].sort((a, b) => sortAsc
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            한국어 교육 데이터 뷰어
          </h1>
          <p className="text-gray-600 text-lg">
            한국어 학습 피드백과 베타 대기자 현황을 한눈에 확인하세요
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              전체 보기
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              사용자별 보기
            </button>
            <button
              onClick={() => setActiveTab('sentence')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'sentence' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              문장별 보기
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'waitlist' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              베타 대기자 ({data?.beta_waitlist?.length || 0})
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 ml-auto"
            >
              {loading ? '로딩 중...' : '새로고침'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'all' ? (
            <div className="space-y-4">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-800 mr-4">전체 학습 피드백 로그</h3>
                <button
                  className="px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                  onClick={() => setSortAsc((prev) => !prev)}
                >
                  {sortAsc ? '시간순 ▲' : '역순 ▼'}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">시간</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">사용자ID</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">문장</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">답변</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">정답</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">피드백</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortByTime(data?.vocab_feedback_log || []).map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{formatDate(item.created_at)}</td>
                        <td className="px-4 py-2 text-xs text-gray-700 whitespace-nowrap">{userIdMap[item.anon_id]}</td>
                        <td className="px-4 py-2 text-gray-900 max-w-xs break-words">{item.sentence}</td>
                        <td className="px-4 py-2 text-gray-800">{item.guess}</td>
                        <td className="px-4 py-2 text-green-700 font-semibold">{item.answer}</td>
                        <td className={`px-4 py-2 text-xs ${getFeedbackColor(item.feedback)}`}>{item.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'user' ? (
            <div className="space-y-4">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-800 mr-4">사용자별 학습 피드백</h3>
                <button
                  className="px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                  onClick={() => setSortAsc((prev) => !prev)}
                >
                  {sortAsc ? '시간순 ▲' : '역순 ▼'}
                </button>
              </div>
              {Object.entries(groupByUser(data?.vocab_feedback_log || []))
                .sort((a, b) => b[1].length - a[1].length)
                .map(([anon_id, logs]) => (
                  <div key={anon_id} className="mb-8">
                    <div className="mb-2 font-semibold text-blue-700">{userIdMap[anon_id]} <span className="ml-2 text-xs text-gray-500">({logs.length}개 응답)</span></div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">시간</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">문장</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">답변</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">정답</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">피드백</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {sortByTime(logs).map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{formatDate(item.created_at)}</td>
                              <td className="px-4 py-2 text-gray-900 max-w-xs break-words">{item.sentence}</td>
                              <td className="px-4 py-2 text-gray-800">{item.guess}</td>
                              <td className="px-4 py-2 text-green-700 font-semibold">{item.answer}</td>
                              <td className={`px-4 py-2 text-xs ${getFeedbackColor(item.feedback)}`}>{item.feedback}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          ) : activeTab === 'sentence' ? (
            <div className="space-y-4">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-800 mr-4">문장별 학습 피드백</h3>
                <button
                  className="px-3 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                  onClick={() => setSortAsc((prev) => !prev)}
                >
                  {sortAsc ? '시간순 ▲' : '역순 ▼'}
                </button>
              </div>
              {Object.entries(groupBySentence(data?.vocab_feedback_log || [])).map(([sentence, logs]) => (
                <div key={sentence} className="mb-8 border border-gray-200 rounded-lg">
                  <button
                    className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-blue-100 rounded-t-lg font-semibold text-blue-700 flex justify-between items-center"
                    onClick={() => setExpandedSentences(prev => ({ ...prev, [sentence]: !prev[sentence] }))}
                  >
                    <span>문장: <span className="text-gray-900">{sentence}</span> <span className="ml-2 text-xs text-gray-500">({logs.length}개 응답)</span></span>
                    <span>{expandedSentences[sentence] ? '▲' : '▼'}</span>
                  </button>
                  {expandedSentences[sentence] && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border-t border-gray-200 rounded-b-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">시간</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">사용자</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">답변</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">정답</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-b">피드백</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {sortByTime(logs).map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">{formatDate(item.created_at)}</td>
                              <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{userIdMap[item.anon_id]}</td>
                              <td className="px-4 py-2 text-gray-800">{item.guess}</td>
                              <td className="px-4 py-2 text-green-700 font-semibold">{item.answer}</td>
                              <td className={`px-4 py-2 text-xs ${getFeedbackColor(item.feedback)}`}>{item.feedback}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">베타 대기자 명단</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">순번</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">이메일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">가입일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data?.beta_waitlist?.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data && activeTab !== 'waitlist' && (
            <div className="mt-6 text-sm text-gray-600">
              총 {data.vocab_feedback_log?.length || 0}개의 학습 피드백이 있습니다.
            </div>
          )}
          {data && activeTab === 'waitlist' && (
            <div className="mt-6 text-sm text-gray-600">
              총 {data.beta_waitlist?.length || 0}명의 베타 대기자가 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 