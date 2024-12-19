import React, { useState, useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import styles from './mermaid.module.css'

// mermaid 초기화 설정
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
  },
})

const ScoreCalculator = () => {
  const [scores, setScores] = useState({
    inbound: {
      base: 40,
      website: 30,
      social: 20,
      event: 40,
    },
    outbound: {
      base: 30,
      coldCall: 25,
      email: 15,
    },
    revenue: {
      high: 40,
      mid: 25,
      low: 10,
    },
    employees: {
      high: 40,
      mid: 25,
      low: 10,
    },
    listing: {
      high: 40,
      mid: 25,
      low: 10,
    },
  })

  const [selectedPath, setSelectedPath] = useState({
    channel: '',
    revenue: '',
    employees: '',
    listing: '',
  })

  const [diagram, setDiagram] = useState('')
  const mermaidRef = useRef(null)

  const handlePathSelect = (type, value) => {
    setSelectedPath((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const calculateTotalScore = () => {
    let total = 0

    // 채널 점수 계산
    if (selectedPath.channel) {
      const [type, channel] = selectedPath.channel.split('-')
      total += scores[type].base + scores[type][channel]
    }

    // 회사 규모 점수 계산
    if (selectedPath.revenue) total += scores.revenue[selectedPath.revenue]
    if (selectedPath.employees)
      total += scores.employees[selectedPath.employees]
    if (selectedPath.listing) total += scores.listing[selectedPath.listing]

    return total
  }

  const generateDiagram = () => {
    const totalScore = calculateTotalScore()
    const priority =
      totalScore >= 140
        ? 'High Priority'
        : totalScore >= 100
          ? 'Mid Priority'
          : 'Low Priority'

    return `
      flowchart TD
        subgraph lead_gen["리드 수집 (현재 점수: ${totalScore})"]
          subgraph inbound["인바운드 (기본점수 ${scores.inbound.base}점)"]
            I1["웹사이트\n+${scores.inbound.website}점"]
            I2["소셜미디어\n+${scores.inbound.social}점"]
            I3["이벤트/세미나\n+${scores.inbound.event}점"]
          end
          
          subgraph outbound["아웃바운드 (기본점수 ${scores.outbound.base}점)"]
            O1["콜드콜\n+${scores.outbound.coldCall}점"]
            O2["이메일 캠페인\n+${scores.outbound.email}점"]
          end
        end

        subgraph company_size["회사 규모"]
          subgraph revenue["매출액"]
            R1["1000억 이상\n+${scores.revenue.high}점"]
            R2["500억~1000억\n+${scores.revenue.mid}점"]
            R3["500억 미만\n+${scores.revenue.low}점"]
          end
          
          subgraph employees["직원수"]
            E1["300명 이상\n+${scores.employees.high}점"]
            E2["100~300명\n+${scores.employees.mid}점"]
            E3["100명 미만\n+${scores.employees.low}점"]
          end
          
          subgraph listing["상장여부"]
            L1["상장기업\n+${scores.listing.high}점"]
            L2["비상장 중견\n+${scores.listing.mid}점"]
            L3["비상장 중소\n+${scores.listing.low}점"]
          end
        end

        P["${priority}\n(${totalScore}점)"]

        %% Dynamic path based on selection
        ${selectedPath.channel === 'inbound-website' ? 'I1' : ''}
        ${selectedPath.channel === 'inbound-social' ? 'I2' : ''}
        ${selectedPath.channel === 'inbound-event' ? 'I3' : ''}
        ${selectedPath.channel === 'outbound-coldCall' ? 'O1' : ''}
        ${selectedPath.channel === 'outbound-email' ? 'O2' : ''}
        
        ${
          selectedPath.channel
            ? `${
                selectedPath.channel.includes('inbound')
                  ? selectedPath.channel.split('-')[1] === 'website'
                    ? 'I1'
                    : selectedPath.channel.split('-')[1] === 'social'
                      ? 'I2'
                      : 'I3'
                  : selectedPath.channel.split('-')[1] === 'coldCall'
                    ? 'O1'
                    : 'O2'
              } --> ${
                selectedPath.revenue === 'high'
                  ? 'R1'
                  : selectedPath.revenue === 'mid'
                    ? 'R2'
                    : selectedPath.revenue === 'low'
                      ? 'R3'
                      : ''
              }`
            : ''
        }

        ${
          selectedPath.revenue
            ? `${
                selectedPath.revenue === 'high'
                  ? 'R1'
                  : selectedPath.revenue === 'mid'
                    ? 'R2'
                    : 'R3'
              } --> 
           ${
             selectedPath.employees === 'high'
               ? 'E1'
               : selectedPath.employees === 'mid'
                 ? 'E2'
                 : selectedPath.employees === 'low'
                   ? 'E3'
                   : ''
           }`
            : ''
        }

        ${
          selectedPath.employees
            ? `${
                selectedPath.employees === 'high'
                  ? 'E1'
                  : selectedPath.employees === 'mid'
                    ? 'E2'
                    : 'E3'
              } --> 
           ${
             selectedPath.listing === 'high'
               ? 'L1'
               : selectedPath.listing === 'mid'
                 ? 'L2'
                 : selectedPath.listing === 'low'
                   ? 'L3'
                   : ''
           }`
            : ''
        }

        ${
          selectedPath.listing
            ? `${
                selectedPath.listing === 'high'
                  ? 'L1'
                  : selectedPath.listing === 'mid'
                    ? 'L2'
                    : 'L3'
              } --> P`
            : ''
        }

        %% Styling
        classDef default fill:#fff,stroke:#333,stroke-width:2px;
        classDef highlight fill:#f96,stroke:#333,stroke-width:3px;
    `
  }

  useEffect(() => {
    const renderDiagram = async () => {
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = ''
        const newDiagram = generateDiagram()
        try {
          const { svg } = await mermaid.render('mermaid-diagram', newDiagram)
          mermaidRef.current.innerHTML = svg
        } catch (error) {
          console.error('Mermaid rendering failed:', error)
        }
      }
    }

    renderDiagram()
  }, [selectedPath, scores])
  return (
    <div className={styles.calculatorContainer}>
      <h1 className={styles.title}>리드 스코어 계산기</h1>

      <div className={styles.layout}>
        {/* 왼쪽 패널 */}
        <div className={styles.leftPanel}>
          <div className={styles.controlCard}>
            <h2 className={styles.controlTitle}>경로 선택</h2>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>채널:</label>
              <select
                className={styles.formSelect}
                value={selectedPath.channel}
                onChange={(e) => handlePathSelect('channel', e.target.value)}
              >
                <option value=''>선택하세요</option>
                <option value='inbound-website'>웹사이트</option>
                <option value='inbound-social'>소셜미디어</option>
                <option value='inbound-event'>이벤트/세미나</option>
                <option value='outbound-coldCall'>콜드콜</option>
                <option value='outbound-email'>이메일 캠페인</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>매출액:</label>
              <select
                className={styles.formSelect}
                value={selectedPath.revenue}
                onChange={(e) => handlePathSelect('revenue', e.target.value)}
              >
                <option value=''>선택하세요</option>
                <option value='high'>1000억 이상</option>
                <option value='mid'>500억~1000억</option>
                <option value='low'>500억 미만</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>직원수:</label>
              <select
                className={styles.formSelect}
                value={selectedPath.employees}
                onChange={(e) => handlePathSelect('employees', e.target.value)}
              >
                <option value=''>선택하세요</option>
                <option value='high'>300명 이상</option>
                <option value='mid'>100~300명</option>
                <option value='low'>100명 미만</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>상장여부:</label>
              <select
                className={styles.formSelect}
                value={selectedPath.listing}
                onChange={(e) => handlePathSelect('listing', e.target.value)}
              >
                <option value=''>선택하세요</option>
                <option value='high'>상장기업</option>
                <option value='mid'>비상장 중견</option>
                <option value='low'>비상장 중소</option>
              </select>
            </div>
          </div>

          <div className={styles.controlCard}>
            <h2 className={styles.controlTitle}>추가 설정</h2>
            {/* 추가 설정 컨트롤들이 들어갈 자리 */}
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <div className={styles.rightPanel}>
          <h2 className={styles.controlTitle}>플로우 차트</h2>
          <div ref={mermaidRef} className={styles.chartContainer}></div>
        </div>
      </div>
    </div>
  )
}

export default ScoreCalculator
