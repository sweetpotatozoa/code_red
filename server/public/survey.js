!(function () {
  console.log('CatchTalk script loaded'),
    (window.CatchTalk = {
      activeSurveyId: null,
      currentStep: 0,
      surveyResponseId: null,
      surveyResponses: [],
      surveys: [],
      environmentId: null,
    })
  let l = new WeakMap()
  function i(e, t) {
    localStorage.setItem('survey-' + e, JSON.stringify(t))
  }
  function s(e) {
    if (!e.updateAt)
      return console.error(`Survey ${e._id}: Missing 'updateAt' field`), !1
    if (!Array.isArray(e.triggers) || 0 === e.triggers.length)
      return (
        console.error(`Survey ${e._id}: 'triggers' must be a non-empty array`),
        !1
      )
    if (!Array.isArray(e.steps) || 0 === e.steps.length)
      return (
        console.error(`Survey ${e._id}: 'steps' must be a non-empty array`), !1
      )
    if (!e.delay || !e.delay.delayType)
      return (
        console.error(`Survey ${e._id}: Missing 'delay.delayType' field`), !1
      )
    if ('number' != typeof e.delay.delayValue)
      return (
        console.error(`Survey ${e._id}: 'delay.delayValue' must be a number`),
        !1
      )
    for (var t of e.steps) {
      if (!t.id)
        return console.error(`Survey ${e._id}: Missing 'id' in step`), !1
      if (void 0 === t.title)
        return (
          console.error(`Survey ${e._id}: Missing 'title' in step ` + t.id), !1
        )
      if (void 0 === t.description)
        return (
          console.error(
            `Survey ${e._id}: Missing 'description' in step ` + t.id,
          ),
          !1
        )
      switch (t.type) {
        case 'singleChoice':
        case 'rating':
          if (!Array.isArray(t.options))
            return (
              console.error(
                `Survey ${e._id}: 'options' must be an array in ${t.type} step ` +
                  t.id,
              ),
              !1
            )
          for (var a of t.options) {
            if (!a.id)
              return (
                console.error(
                  `Survey ${e._id}: Missing 'id' in option of step ` + t.id,
                ),
                !1
              )
            if (void 0 === a.value)
              return (
                console.error(
                  `Survey ${e._id}: Missing 'value' in option ${a.id} of step ` +
                    t.id,
                ),
                !1
              )
            if (void 0 === a.nextStepId)
              return (
                console.error(
                  `Survey ${e._id}: Missing 'nextStepId' in option ${a.id} of step ` +
                    t.id,
                ),
                !1
              )
          }
          break
        case 'multipleChoice':
          if (!Array.isArray(t.options))
            return (
              console.error(
                `Survey ${e._id}: 'options' must be an array in ${t.type} step ` +
                  t.id,
              ),
              !1
            )
          for (var r of t.options) {
            if (!r.id)
              return (
                console.error(
                  `Survey ${e._id}: Missing 'id' in option of step ` + t.id,
                ),
                !1
              )
            if (void 0 === r.value)
              return (
                console.error(
                  `Survey ${e._id}: Missing 'value' in option ${r.id} of step ` +
                    t.id,
                ),
                !1
              )
          }
          if (void 0 === t.nextStepId)
            return (
              console.error(
                `Survey ${e._id}: Missing 'nextStepId' in multipleChoice step ` +
                  t.id,
              ),
              !1
            )
          break
        case 'welcome':
        case 'thank':
        case 'link':
        case 'freeText':
        case 'info':
          if (void 0 === t.nextStepId)
            return (
              console.error(
                `Survey ${e._id}: Missing 'nextStepId' in step ` + t.id,
              ),
              !1
            )
          break
        default:
          return (
            console.error(
              `Survey ${e._id}: Unknown step type '${t.type}' in step ` + t.id,
            ),
            !1
          )
      }
    }
    return !0
  }
  function t(e) {
    var t = document.createElement('div'),
      a = ((t.className = 'survey-step'), document.createElement('div')),
      r = ((a.className = 'survey-header'), document.createElement('button')),
      n =
        ((r.type = 'button'),
        (r.id = 'closeSurvey'),
        (r.className = 'close-button'),
        document.createElement('img')),
      n =
        ((n.src = CatchTalk.apiHost + '/images/close.svg'),
        (n.alt = 'close'),
        (n.className = 'close-icon'),
        r.appendChild(n),
        a.appendChild(r),
        t.appendChild(a),
        document.createElement('div')),
      r = ((n.className = 'content-wrapper'), document.createElement('div')),
      a =
        ((r.className = 'text-content'),
        e.title &&
          (((a = document.createElement('p')).className = 'survey-title'),
          (a.textContent = e.title),
          r.appendChild(a)),
        e.description &&
          (((a = document.createElement('p')).className = 'survey-description'),
          (a.textContent = e.description),
          r.appendChild(a)),
        n.appendChild(r),
        c(e)),
      r = (a && n.appendChild(a), o(e)),
      r =
        (r &&
          (((a = document.createElement('div')).className = 'button-container'),
          ((e = document.createElement('button')).type = 'button'),
          (e.id = 'nextStepButton'),
          (e.className = 'submit-button'),
          (e.textContent = r),
          a.appendChild(e),
          n.appendChild(a)),
        t.appendChild(n),
        document.createElement('div')),
      e = ((r.className = 'survey-progress'), document.createElement('p')),
      a =
        ((e.className = 'powered-by'),
        (e.innerHTML = 'Powered by <span class="logo">CatchTalk</span>'),
        r.appendChild(e),
        document.createElement('div')),
      n = ((a.className = 'background-bar'), document.createElement('div'))
    return (
      (n.className = 'progress-bar'),
      a.appendChild(n),
      r.appendChild(a),
      t.appendChild(r),
      t
    )
  }
  function a(t, e) {
    var a = document.querySelector('.progress-bar')
    a &&
      ((e = ((e.findIndex((e) => e.id === t) + 1) / e.length) * 100),
      (a.style.width = e + '%'))
  }
  function o(e) {
    switch (e.type) {
      case 'welcome':
        return '참여하기'
      case 'link':
        return e.buttonText || '링크로 이동'
      case 'thank':
        return '닫기'
      default:
        return '다음'
    }
  }
  function c(i) {
    switch (i.type) {
      case 'singleChoice':
      case 'multipleChoice':
        let n = document.createElement('div')
        return (
          (n.className = 'optionContainer'),
          i.options.forEach((e) => {
            var t = document.createElement('label'),
              a =
                ((t.className = 'optionLabel'),
                document.createElement('input')),
              r =
                ((a.type = 'singleChoice' === i.type ? 'radio' : 'checkbox'),
                (a.name = i.type),
                (a.value = e.value),
                (a.id = i.type + '-' + e.id),
                document.createElement('span'))
            ;(r.textContent = e.value),
              t.appendChild(a),
              t.appendChild(r),
              n.appendChild(t)
          }),
          n
        )
      case 'rating':
        let r = document.createElement('div')
        return (
          (r.className = 'starInputContainer'),
          [...i.options].reverse().forEach((e) => {
            var t = document.createElement('label'),
              a =
                ((t.className = 'starOptionLabel'),
                document.createElement('input')),
              e =
                ((a.type = 'radio'),
                (a.name = 'rating'),
                (a.value = e.value),
                (a.id = 'rating-' + e.id),
                document.createElement('span'))
            ;(e.className = 'star'),
              (e.textContent = '★'),
              t.appendChild(a),
              t.appendChild(e),
              r.appendChild(t)
          }),
          r
        )
      case 'freeText':
        var e = document.createElement('textarea')
        return (
          (e.name = 'response'),
          (e.id = 'response'),
          (e.rows = 4),
          (e.cols = 50),
          (e.className = 'freeTextArea'),
          e
        )
      default:
        return null
    }
  }
  function y(e) {
    switch (e.type) {
      case 'welcome':
        return 'clicked'
      case 'singleChoice':
        var t = document.querySelector('input[name="singleChoice"]:checked')
        return t
          ? { id: t.id.replace('singleChoice-', ''), value: t.value }
          : null
      case 'multipleChoice':
        t = Array.from(
          document.querySelectorAll('input[name="multipleChoice"]:checked'),
        )
        return 0 < t.length
          ? t.map((e) => ({
              id: e.id.replace('multipleChoice-', ''),
              value: e.value,
            }))
          : null
      case 'rating':
        t = document.querySelector('.starOptionLabel.checked')
        return t
          ? {
              id: t.querySelector('input').id.replace('rating-', ''),
              value: 5 - Array.from(t.parentNode.children).indexOf(t),
            }
          : null
      case 'freeText':
        t = document.getElementById('response')
        return t ? t.value : ''
      case 'link':
      case 'info':
        return 'clicked'
      default:
        return ''
    }
  }
  function u(t, a) {
    let r
    return function (...e) {
      clearTimeout(r),
        (r = setTimeout(() => {
          clearTimeout(r), t(...e)
        }, a))
    }
  }
  Object.assign(CatchTalk, {
    getSurveyData: function (e) {
      return (e = localStorage.getItem('survey-' + e)) ? JSON.parse(e) : null
    },
    saveSurveyData: i,
    saveResponse: function (e, t) {
      CatchTalk.surveyResponses.push({
        stepId: e.id,
        stepTitle: e.title,
        stepDescription: e.description,
        answer: t,
        type: e.type,
        timestamp: new Date().toISOString(),
      })
    },
    fetchSurvey: async function (e) {
      try {
        var a = await fetch(
          CatchTalk.apiHost + `/api/appliedSurvey?userId=${e}&isDeploy=true`,
        )
        if (!a.ok) throw new Error('Network response was not ok')
        var r = await a.json(),
          n = r.data.filter(s),
          i = await fetch(CatchTalk.apiHost + '/api/appliedSurvey/users/' + e)
        if (!i.ok) throw new Error('Network response was not ok')
        let t = (await i.json()).surveyPosition
        return (
          n.forEach((e) => {
            e.position = t
          }),
          { status: r.status, data: n }
        )
      } catch (e) {
        return console.error('Error fetching survey:', e), null
      }
    },
    createResponse: async function (e, t, a) {
      try {
        var r = await fetch(CatchTalk.apiHost + '/api/appliedSurvey/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: e,
            surveyId: t,
            answers: [a],
            createAt: a.timestamp,
            completeAt: null,
            isComplete: !1,
          }),
        })
        if (r.ok) return (await r.json()).data._id
        throw new Error('HTTP error! status: ' + r.status)
      } catch (e) {
        throw (console.error('Error in createResponse:', e), e)
      }
    },
    updateResponse: async function (e, t, a) {
      try {
        var r,
          n = await fetch(
            CatchTalk.apiHost + '/api/appliedSurvey/response/' + e,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                answers: t,
                completeAt: a ? new Date() : null,
                isComplete: a,
              }),
            },
          )
        if (n.ok)
          return (
            (r = JSON.parse(
              localStorage.getItem('survey-' + CatchTalk.activeSurveyId),
            )) && ((r.completed = !0), i(CatchTalk.activeSurveyId, r)),
            n.json()
          )
        throw new Error('HTTP error! status: ' + n.status)
      } catch (e) {
        throw (console.error('Error in updateResponse:', e), e)
      }
    },
    incrementViews: async function (e) {
      try {
        await fetch(
          CatchTalk.apiHost + `/api/appliedSurvey/${e}/increment-views`,
          { method: 'POST' },
        )
      } catch (e) {
        console.error('error in incrementViews:', e)
      }
    },
  }),
    (CatchTalk.validateSurvey = s),
    Object.assign(CatchTalk, {
      canShowSurvey: function (e) {
        if (!(t = CatchTalk.getSurveyData(e._id))) return !0
        var { lastShownTime: t, completed: a } = t,
          r = (new Date() - new Date(t)) / 1e3
        switch (e.delay.delayType) {
          case 'once':
            return !1
          case 'untilCompleted':
            return a ? !1 : r >= e.delay.delayValue
          case 'always':
            return r >= e.delay.delayValue
          default:
            return !1
        }
      },
      showStep: async function l(u, e) {
        let d = u.steps.filter(
            (e) => ('welcome' !== e.type && 'thank' !== e.type) || e.isActive,
          ),
          p = d[e]
        e = document.getElementById('survey-popup')
        if (p) {
          if (
            ((e.innerHTML = ''),
            e.appendChild(t(p)),
            (document.getElementById('closeSurvey').onclick = () => {
              CatchTalk.closeSurvey(u._id, 'thank' === p.type)
            }),
            'singleChoice' === p.type || 'multipleChoice' === p.type)
          ) {
            let t = document.querySelectorAll('.optionLabel')
            t.forEach((e) => {
              e.querySelector('input').addEventListener('change', function () {
                'singleChoice' === p.type &&
                  t.forEach((e) => e.classList.remove('checked')),
                  this.checked
                    ? e.classList.add('checked')
                    : e.classList.remove('checked')
              })
            })
          }
          if (
            ((e = document.getElementById('nextStepButton')) &&
              ('thank' === p.type
                ? (e.onclick = () => CatchTalk.closeSurvey(u._id, !0))
                : (e.onclick = async function (r) {
                    if ((r.preventDefault(), null !== (r = y(p)))) {
                      CatchTalk.saveResponse(p, r)
                      try {
                        if (
                          (CatchTalk.surveyResponseId
                            ? await CatchTalk.updateResponse(
                                CatchTalk.surveyResponseId,
                                CatchTalk.surveyResponses,
                                !1,
                              )
                            : (CatchTalk.surveyResponseId =
                                await CatchTalk.createResponse(
                                  CatchTalk.environmentId,
                                  u._id,
                                  { ...CatchTalk.surveyResponses[0] },
                                )),
                          'link' === p.type)
                        ) {
                          if (!p.url)
                            return void console.error(
                              'Missing URL in link step',
                            )
                          window.open(
                            p.url.startsWith('http')
                              ? p.url
                              : 'https://' + p.url,
                            '_blank',
                          )
                        }
                        let a
                        if ('singleChoice' === p.type || 'rating' === p.type) {
                          let t = r.id
                          var n = p.options.find((e) => e.id === t)
                          a = n ? n.nextStepId : null
                        } else a = p.nextStepId
                        var t,
                          i,
                          s,
                          o,
                          c = u.steps.find((e) => 'thank' === e.type)
                        let e = !1
                        c &&
                          ('' === a || null === a
                            ? ((t = d.findIndex((e) => e.id === p.id)),
                              (((i = d[t + 1]) && 'thank' === i.type) || !i) &&
                                (e = !0))
                            : a === c.id && (e = !0)),
                          await CatchTalk.updateResponse(
                            CatchTalk.surveyResponseId,
                            CatchTalk.surveyResponses,
                            e,
                          ),
                          a && '' !== a
                            ? -1 !== (s = d.findIndex((e) => e.id === a))
                              ? l(u, s)
                              : CatchTalk.closeSurvey(u._id, e)
                            : (o = d.findIndex((e) => e.id === p.id)) <
                              d.length - 1
                            ? l(u, o + 1)
                            : CatchTalk.closeSurvey(u._id, e)
                      } catch (e) {
                        console.error('Error while submitting survey:', e)
                      }
                    }
                  })),
            'rating' === p.type &&
              (e = document.querySelector('.starInputContainer')))
          ) {
            let t = e.querySelectorAll('.starOptionLabel')
            t.forEach((e, a) => {
              e.addEventListener('click', () => {
                t.forEach((e, t) => {
                  a <= t
                    ? e.classList.add('checked')
                    : e.classList.remove('checked')
                })
              })
            })
          }
          a(p.id, u.steps)
        } else CatchTalk.closeSurvey(u._id, !1)
      },
      closeSurvey: function (e, t = !1) {
        var a = document.getElementById('survey-popup')
        a && a.remove(),
          (CatchTalk.activeSurveyId = null),
          window.dispatchEvent(new Event('surveyCompleted')),
          CatchTalk.surveyResponseId &&
            CatchTalk.updateResponse(
              CatchTalk.surveyResponseId,
              CatchTalk.surveyResponses,
              t,
            )
      },
      generateStepHTML: t,
      updateProgressBar: a,
      getButtonText: o,
      generateStepContent: c,
      getResponse: y,
    })
  let d = u((e) => {
    for (var t of e)
      if (null === CatchTalk.activeSurveyId && CatchTalk.canShowSurvey(t)) {
        CatchTalk.loadSurvey(t)
        break
      }
  }, 200)
  function p(e) {
    var t, a
    return (
      'all' === e.pageType ||
      ('specific' === e.pageType &&
        ((t = window.location.pathname),
        (a = window.location.hash),
        '#checkConnection' === e.pageValue
          ? '#checkConnection' === a
          : t === e.pageValue || ('/' === t && '' === e.pageValue)))
    )
  }
  function h(a, r, n) {
    switch (a.type) {
      case 'scroll':
        let e = u(() => {
          0.01 <=
            (window.scrollY + window.innerHeight) /
              document.body.scrollHeight && d(r)
        }, 200)
        window.addEventListener('scroll', e),
          console.log('Scroll trigger set for ' + window.location.pathname),
          n.set('scroll', () => window.removeEventListener('scroll', e))
        break
      case 'exit':
        let t = (e) => {
          e.clientY <= 0 && d(r)
        }
        document.addEventListener('mouseleave', t),
          console.log('Exit trigger set for ' + window.location.pathname),
          n.set('exit', () => document.removeEventListener('mouseleave', t))
        break
      case 'click':
        if ('css' === a.clickType) {
          var i = a.clickValue
            .trim()
            .split(/\s+/)
            .map((e) =>
              e.startsWith('#')
                ? '#' + CSS.escape(e.slice(1))
                : e.startsWith('.')
                ? '.' + CSS.escape(e.slice(1))
                : '.' + CSS.escape(e),
            )
            .join('')
          {
            var s = i
            var o = r
            var c = n
            let t = (t) => {
                if (!l.has(t)) {
                  let e = () => d(o)
                  t.addEventListener('click', e),
                    l.set(t, !0),
                    console.log('Click trigger set for ' + s),
                    c.set(t, () => {
                      t.removeEventListener('click', e), l.delete(t)
                    })
                }
              },
              e =
                (document.querySelectorAll(s).forEach(t),
                new MutationObserver((e) => {
                  e.forEach((e) => {
                    'attributes' === e.type &&
                      'class' === e.attributeName &&
                      document.querySelectorAll(s).forEach(t)
                  })
                }))
            e.observe(document.body, {
              attributes: !0,
              subtree: !0,
              attributeFilter: ['class'],
            }),
              c.set('clickObserver', () => e.disconnect())
          }
        } else
          'text' === a.clickType &&
            (function (e) {
              let t = [],
                a = document.createTreeWalker(
                  e,
                  NodeFilter.SHOW_TEXT,
                  null,
                  !1,
                ),
                r
              for (; (r = a.nextNode()); ) t.push(r)
              return t
            })(document.body).forEach((e) => {
              if (e.textContent.trim() === a.clickValue) {
                let t = e.parentElement
                if (!l.has(t)) {
                  let e = (e) => {
                    e.target.textContent.trim() === a.clickValue && d(r)
                  }
                  t.addEventListener('click', e),
                    l.set(t, !0),
                    n.set(t, () => {
                      t.removeEventListener('click', e), l.delete(t)
                    })
                }
              }
            })
        break
      case 'firstVisit':
        p(a) &&
          ((('#checkConnection' === a.pageValue &&
            '#checkConnection' === window.location.hash) ||
            '#checkConnection' !== a.pageValue) &&
            d(r),
          console.log(
            'First Visit trigger set for ' + (a.pageValue || 'all pages'),
          ))
        break
      default:
        console.error('Unknown trigger type: ' + a.type)
    }
  }
  'function' != typeof CSS.escape &&
    (CSS.escape = function (e) {
      return String(e)
        .replace(
          /[\0-\x1F\x7F-\x9F\xA0\xAD\u0600-\u0604\u070F\u17B4\u17B5\u2000-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\uFFF0-\uFFF8\uD800-\uF8FF\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
          function (e) {
            return '\\' + e.charCodeAt(0).toString(16) + ' '
          },
        )
        .replace(/[\s\S]/g, function (e) {
          switch (e) {
            case ' ':
            case '"':
            case '#':
            case '$':
            case '%':
            case '&':
            case "'":
            case '(':
            case ')':
            case '*':
            case '+':
            case ',':
            case '.':
            case '/':
            case ';':
            case '<':
            case '=':
            case '>':
            case '?':
            case '@':
            case '[':
            case '\\':
            case ']':
            case '^':
            case '`':
            case '{':
            case '|':
            case '}':
            case '~':
              return '\\' + e
            default:
              return e
          }
        })
    }),
    Object.assign(CatchTalk, {
      setupTriggers: function (e) {
        CatchTalk.surveys = e
        let n = new Map(),
          i = { firstVisit: 1, exit: 2, scroll: 3, click: 4 },
          t =
            (CatchTalk.surveys.forEach((r) => {
              r.triggers.forEach((e) => {
                var t,
                  a,
                  e = JSON.stringify({ ...e, priority: i[e.type] })
                n.has(e)
                  ? -1 ===
                    (a = (t = n.get(e)).findIndex(
                      (e) => new Date(r.updateAt) > new Date(e.updateAt),
                    ))
                    ? t.push(r)
                    : t.splice(a, 0, r)
                  : n.set(e, [r])
              })
            }),
            Array.from(n.entries()).sort((e, t) => {
              var a = JSON.parse(e[0]),
                r = JSON.parse(t[0])
              return a.priority === r.priority
                ? new Date(n.get(t[0])[0].updateAt) -
                    new Date(n.get(e[0])[0].updateAt)
                : a.priority - r.priority
            })),
          a = new Map()
        function r() {
          t.forEach(([e, t]) => {
            e = JSON.parse(e)
            p(e) && h(e, t, a)
          })
        }
        r()
        {
          var s = () => {
            a.forEach((e) => e()), a.clear(), r()
          }
          let e = history.pushState,
            t = history.replaceState
          ;(history.pushState = function () {
            e.apply(this, arguments), s()
          }),
            (history.replaceState = function () {
              t.apply(this, arguments), s()
            }),
            window.addEventListener('popstate', s)
        }
        return () => {
          a.forEach((e) => e()), a.clear()
        }
      },
      loadSurvey: function (t) {
        var e
        null === CatchTalk.activeSurveyId &&
          ((CatchTalk.activeSurveyId = t._id),
          (CatchTalk.currentStep = 0),
          (CatchTalk.surveyResponses = []),
          ((e = document.createElement('link')).rel = 'stylesheet'),
          (e.type = 'text/css'),
          (e.href = CatchTalk.apiHost + '/survey.css'),
          document.head.appendChild(e),
          (e.onload = async () => {
            var e = document.createElement('div')
            ;(e.id = 'survey-popup'),
              e.classList.add('survey-popup-position-' + t.position),
              document.body.appendChild(e),
              await CatchTalk.incrementViews(t._id),
              CatchTalk.showStep(t, CatchTalk.currentStep),
              CatchTalk.saveSurveyData(t._id, {
                lastShownTime: new Date().toISOString(),
                completed: !1,
              })
          }))
      },
      isCorrectPage: p,
    }),
    (CatchTalk.init = async function (e) {
      if (!e || !e.environmentId)
        throw new Error('Environment ID is required in the configuration')
      ;(CatchTalk.environmentId = e.environmentId),
        (CatchTalk.apiHost = e.apiHost)
      try {
        var a = await CatchTalk.fetchSurvey(CatchTalk.environmentId)
        if (a) {
          let t = CatchTalk.setupTriggers(a.data)
          window.addEventListener('beforeunload', () =>
            t(CatchTalk.activeSurveyId),
          ),
            window.addEventListener('surveyCompleted', function e() {
              t(CatchTalk.activeSurveyId),
                window.removeEventListener('surveyCompleted', e)
            })
        }
      } catch (e) {
        console.error('Error initializing survey script:', e)
      }
    }),
    'complete' === document.readyState
      ? console.log('CatchTalk script is ready to be initialized')
      : window.addEventListener('load', function () {
          console.log('CatchTalk script is ready to be initialized')
        })
})()
