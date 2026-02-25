import { useState, useEffect } from "react";

const SAMPLE_PROMPTS = [
  {
    id: 1,
    prompt: "Explain how a transformer model works in simple terms.",
    responseA: "A transformer model is a type of neural network that uses attention mechanisms to process sequential data. It works by looking at all parts of the input simultaneously rather than one at a time, allowing it to understand context better. The key innovation is 'self-attention' which lets the model weigh the importance of different words when encoding meaning.",
    responseB: "Transformers are AI models. They use math to understand text. They are good at language tasks like translation. Companies like Google and OpenAI use them.",
    categoryA: ["Accurate", "Clear", "Complete"],
    categoryB: ["Vague", "Oversimplified", "Incomplete"],
  },
  {
    id: 2,
    prompt: "What is the difference between supervised and unsupervised learning?",
    responseA: "In supervised learning, the model trains on labeled data — meaning each input has a known correct output. Examples include image classification and spam detection. In unsupervised learning, the model finds patterns in data without labels. Examples include clustering, anomaly detection, and dimensionality reduction.",
    responseB: "Supervised learning has labels, unsupervised doesn't. Both are types of machine learning. You use them for different things depending on what data you have available for your project.",
    categoryA: ["Accurate", "Well-structured", "Uses examples"],
    categoryB: ["Too brief", "No examples", "Low quality"],
  },
  {
    id: 3,
    prompt: "How does RLHF improve language model safety?",
    responseA: "RLHF — Reinforcement Learning from Human Feedback — improves safety by incorporating human preferences directly into model training. Human evaluators rate model outputs, and these ratings train a reward model that guides the LLM to produce safer, more helpful, and less harmful responses. This bridges the gap between statistical next-token prediction and human values.",
    responseB: "RLHF makes models safer by having humans check the outputs. Humans give feedback and the model learns from it. This is how ChatGPT was made safer than earlier versions of GPT.",
    categoryA: ["Technically accurate", "Deep explanation", "Conceptually complete"],
    categoryB: ["Partially correct", "Lacks depth", "Missing key details"],
  },
];

const CRITERIA = [
  { id: "accuracy", label: "Accuracy", icon: "🎯", desc: "Is the information factually correct?" },
  { id: "clarity", label: "Clarity", icon: "💡", desc: "Is it easy to understand?" },
  { id: "completeness", label: "Completeness", icon: "📋", desc: "Does it fully answer the question?" },
  { id: "safety", label: "Safety", icon: "🛡️", desc: "Is the content safe and appropriate?" },
  { id: "helpfulness", label: "Helpfulness", icon: "🤝", desc: "Is it genuinely useful to the user?" },
];

export default function AIEvaluator() {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [ratings, setRatings] = useState({ A: {}, B: {} });
  const [winner, setWinner] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [activeTab, setActiveTab] = useState("evaluate");
  const [animating, setAnimating] = useState(false);
  const [showTip, setShowTip] = useState(true);

  const prompt = SAMPLE_PROMPTS[currentPrompt];

  const setRating = (response, criterion, value) => {
    setRatings(prev => ({
      ...prev,
      [response]: { ...prev[response], [criterion]: value }
    }));
  };

  const getAvgScore = (response) => {
    const scores = Object.values(ratings[response]);
    if (!scores.length) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const canSubmit = () => {
    const aRated = CRITERIA.every(c => ratings.A[c.id]);
    const bRated = CRITERIA.every(c => ratings.B[c.id]);
    return aRated && bRated && winner;
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;
    const evaluation = {
      id: evaluations.length + 1,
      prompt: prompt.prompt.slice(0, 50) + "...",
      winner,
      scoreA: parseFloat(getAvgScore("A")),
      scoreB: parseFloat(getAvgScore("B")),
      feedback,
      timestamp: new Date().toLocaleTimeString(),
      criteria: { ...ratings },
    };
    setEvaluations(prev => [evaluation, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setAnimating(true);
      setTimeout(() => {
        setRatings({ A: {}, B: {} });
        setWinner(null);
        setFeedback("");
        setSubmitted(false);
        setCurrentPrompt(prev => (prev + 1) % SAMPLE_PROMPTS.length);
        setAnimating(false);
        setShowTip(false);
      }, 600);
    }, 1500);
  };

  const StarRating = ({ response, criterion }) => {
    const current = ratings[response][criterion] || 0;
    return (
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => setRating(response, criterion, star)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: star <= current ? "#F0B429" : "#2A3A4A",
              transition: "all 0.15s",
              padding: "2px",
              transform: star <= current ? "scale(1.1)" : "scale(1)",
            }}
          >★</button>
        ))}
      </div>
    );
  };

  const ScoreBar = ({ score, color }) => (
    <div style={{
      height: 6, background: "#0D1B2A", borderRadius: 3, overflow: "hidden",
      border: "1px solid #1B3A5C"
    }}>
      <div style={{
        height: "100%",
        width: `${(score / 5) * 100}%`,
        background: color,
        borderRadius: 3,
        transition: "width 0.5s ease",
      }} />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060D14",
      fontFamily: "'Courier New', monospace",
      color: "#C8D8E8",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0D1B2A 0%, #0A1520 100%)",
        borderBottom: "2px solid #F0B429",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: "#F0B429",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: "bold", color: "#060D14",
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#F0B429", letterSpacing: 2 }}>
              RLHF EVALUATION PLATFORM
            </div>
            <div style={{ fontSize: 10, color: "#546E7A", letterSpacing: 1 }}>
              AI Response Quality Assessment Tool
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["evaluate", "history", "metrics"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "#F0B429" : "transparent",
                border: `1px solid ${activeTab === tab ? "#F0B429" : "#1B3A5C"}`,
                color: activeTab === tab ? "#060D14" : "#546E7A",
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'Courier New', monospace",
                fontWeight: "bold",
                letterSpacing: 1,
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}
            >{tab}</button>
          ))}
        </div>
        <div style={{
          background: "#0D2A1A",
          border: "1px solid #1B4332",
          borderRadius: 8,
          padding: "6px 14px",
          fontSize: 11,
          color: "#52B788",
          letterSpacing: 1,
        }}>
          ● {evaluations.length} EVAL{evaluations.length !== 1 ? "S" : ""} SUBMITTED
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* EVALUATE TAB */}
        {activeTab === "evaluate" && (
          <div style={{ opacity: animating ? 0 : 1, transition: "opacity 0.4s" }}>

            {/* Tip Banner */}
            {showTip && (
              <div style={{
                background: "#0D1B2A",
                border: "1px solid #1B3A5C",
                borderLeft: "4px solid #F0B429",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12,
                color: "#90A4AE",
              }}>
                <span>💡 <b style={{ color: "#F0B429" }}>Evaluator Tip:</b> Rate each response independently. Then select the overall winner and add qualitative feedback for best RLHF data quality.</span>
                <button onClick={() => setShowTip(false)} style={{
                  background: "none", border: "none", cursor: "pointer", color: "#546E7A", fontSize: 16
                }}>×</button>
              </div>
            )}

            {/* Prompt Card */}
            <div style={{
              background: "#0D1B2A",
              border: "1px solid #1B3A5C",
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{
                    background: "#F0B429", color: "#060D14",
                    padding: "2px 10px", borderRadius: 4, fontSize: 10,
                    fontWeight: "bold", letterSpacing: 1,
                  }}>PROMPT {currentPrompt + 1}/{SAMPLE_PROMPTS.length}</span>
                  <span style={{ fontSize: 10, color: "#546E7A", letterSpacing: 1 }}>GENERAL AI KNOWLEDGE</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {SAMPLE_PROMPTS.map((_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: i === currentPrompt ? "#F0B429" : "#1B3A5C",
                    }} />
                  ))}
                </div>
              </div>
              <div style={{
                fontSize: 15,
                color: "#E8F0F8",
                lineHeight: 1.6,
                fontFamily: "Georgia, serif",
                fontWeight: "bold",
              }}>
                "{prompt.prompt}"
              </div>
            </div>

            {/* Response Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 20,
            }}>
              {["A", "B"].map(resp => (
                <div key={resp} style={{
                  background: "#0D1B2A",
                  border: `1px solid ${winner === resp ? "#F0B429" : "#1B3A5C"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "border-color 0.3s",
                  boxShadow: winner === resp ? "0 0 20px rgba(240, 180, 41, 0.15)" : "none",
                }}>
                  {/* Response Header */}
                  <div style={{
                    background: resp === "A" ? "#0A2040" : "#1A0D2A",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #1B3A5C",
                  }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{
                        width: 28, height: 28,
                        background: resp === "A" ? "#1565C0" : "#4A148C",
                        borderRadius: 6, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 13, fontWeight: "bold", color: "white",
                      }}>{resp}</div>
                      <span style={{ fontSize: 11, color: "#90A4AE", letterSpacing: 1 }}>
                        MODEL RESPONSE {resp}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 20, fontWeight: "bold",
                      color: parseFloat(getAvgScore(resp)) >= 4 ? "#52B788" :
                             parseFloat(getAvgScore(resp)) >= 2.5 ? "#F0B429" : "#EF5350",
                    }}>
                      {getAvgScore(resp) > 0 ? getAvgScore(resp) : "—"}/5
                    </div>
                  </div>

                  {/* Response Text */}
                  <div style={{
                    padding: "16px",
                    fontSize: 12,
                    lineHeight: 1.7,
                    color: "#B0C4D8",
                    fontFamily: "Georgia, serif",
                    minHeight: 120,
                    borderBottom: "1px solid #1B3A5C",
                  }}>
                    {resp === "A" ? prompt.responseA : prompt.responseB}
                  </div>

                  {/* Tags */}
                  <div style={{ padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: 6, borderBottom: "1px solid #1B3A5C" }}>
                    {(resp === "A" ? prompt.categoryA : prompt.categoryB).map((tag, i) => (
                      <span key={i} style={{
                        background: resp === "A" ? "#0A2A18" : "#2A0A1A",
                        border: `1px solid ${resp === "A" ? "#1B4332" : "#4A1040"}`,
                        color: resp === "A" ? "#52B788" : "#F48FB1",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      }}>{tag}</span>
                    ))}
                  </div>

                  {/* Criteria Rating */}
                  <div style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 10, color: "#546E7A", letterSpacing: 1, marginBottom: 10 }}>
                      RATE THIS RESPONSE:
                    </div>
                    {CRITERIA.map(criterion => (
                      <div key={criterion.id} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 13 }}>{criterion.icon}</span>
                          <span style={{ fontSize: 11, color: "#90A4AE" }}>{criterion.label}</span>
                        </div>
                        <StarRating response={resp} criterion={criterion.id} />
                      </div>
                    ))}
                    {getAvgScore(resp) > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <ScoreBar score={parseFloat(getAvgScore(resp))} color={resp === "A" ? "#1565C0" : "#7B1FA2"} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Winner Selection */}
            <div style={{
              background: "#0D1B2A",
              border: "1px solid #1B3A5C",
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, color: "#546E7A", letterSpacing: 1, marginBottom: 14 }}>
                OVERALL PREFERENCE — WHICH RESPONSE IS BETTER?
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {["A", "B", "TIE"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setWinner(opt)}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: winner === opt
                        ? opt === "A" ? "#1565C0"
                          : opt === "B" ? "#4A148C"
                          : "#1B4332"
                        : "#060D14",
                      border: `2px solid ${winner === opt
                        ? opt === "A" ? "#1565C0"
                          : opt === "B" ? "#7B1FA2"
                          : "#2D6A4F"
                        : "#1B3A5C"}`,
                      borderRadius: 10,
                      color: winner === opt ? "white" : "#546E7A",
                      cursor: "pointer",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 13,
                      fontWeight: "bold",
                      letterSpacing: 2,
                      transition: "all 0.2s",
                      transform: winner === opt ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    {opt === "TIE" ? "⚖️ TIE" : `Response ${opt} is Better`}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              <div style={{ fontSize: 11, color: "#546E7A", letterSpacing: 1, marginBottom: 8 }}>
                QUALITATIVE FEEDBACK (OPTIONAL — IMPROVES DATA QUALITY)
              </div>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Explain your evaluation decision... e.g. 'Response A is preferred because it provides concrete examples and covers edge cases. Response B lacks depth and does not address the core mechanism.'"
                style={{
                  width: "100%",
                  minHeight: 80,
                  background: "#060D14",
                  border: "1px solid #1B3A5C",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#C8D8E8",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 11,
                  lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || submitted}
              style={{
                width: "100%",
                padding: "16px",
                background: submitted ? "#1B4332" :
                           canSubmit() ? "#F0B429" : "#1B3A5C",
                border: "none",
                borderRadius: 10,
                color: submitted ? "#52B788" :
                       canSubmit() ? "#060D14" : "#546E7A",
                fontSize: 13,
                fontWeight: "bold",
                fontFamily: "'Courier New', monospace",
                letterSpacing: 2,
                cursor: canSubmit() && !submitted ? "pointer" : "not-allowed",
                transition: "all 0.3s",
                textTransform: "uppercase",
              }}
            >
              {submitted ? "✅ EVALUATION SUBMITTED — LOADING NEXT PROMPT..." :
               canSubmit() ? "⚡ SUBMIT EVALUATION" :
               `RATE ALL CRITERIA + SELECT WINNER TO SUBMIT (${
                 Object.keys(ratings.A).length + Object.keys(ratings.B).length
               }/${CRITERIA.length * 2} rated)`}
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div>
            <div style={{
              fontSize: 11, color: "#546E7A", letterSpacing: 1,
              marginBottom: 16, paddingBottom: 12,
              borderBottom: "1px solid #1B3A5C",
            }}>
              EVALUATION HISTORY — {evaluations.length} RECORD{evaluations.length !== 1 ? "S" : ""}
            </div>
            {evaluations.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
                color: "#546E7A", fontSize: 13,
              }}>
                No evaluations submitted yet.<br />
                <span style={{ color: "#F0B429", cursor: "pointer" }}
                  onClick={() => setActiveTab("evaluate")}>
                  Go to Evaluate tab →
                </span>
              </div>
            ) : (
              evaluations.map(ev => (
                <div key={ev.id} style={{
                  background: "#0D1B2A",
                  border: "1px solid #1B3A5C",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 12,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "#90A4AE" }}>
                      #{ev.id} — {ev.prompt}
                    </div>
                    <div style={{ fontSize: 10, color: "#546E7A" }}>{ev.timestamp}</div>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{
                      background: ev.winner === "A" ? "#0A2040" : ev.winner === "B" ? "#1A0D2A" : "#0A2A18",
                      border: `1px solid ${ev.winner === "A" ? "#1565C0" : ev.winner === "B" ? "#7B1FA2" : "#2D6A4F"}`,
                      borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: "bold",
                      color: ev.winner === "A" ? "#90CAF9" : ev.winner === "B" ? "#CE93D8" : "#52B788",
                    }}>
                      WINNER: {ev.winner === "TIE" ? "⚖️ TIE" : `Response ${ev.winner}`}
                    </div>
                    <div style={{ fontSize: 11, color: "#546E7A" }}>
                      A: <b style={{ color: "#90CAF9" }}>{ev.scoreA}/5</b> &nbsp;
                      B: <b style={{ color: "#CE93D8" }}>{ev.scoreB}/5</b>
                    </div>
                    {ev.feedback && (
                      <div style={{ fontSize: 10, color: "#546E7A", fontStyle: "italic", flex: 1 }}>
                        "{ev.feedback.slice(0, 80)}{ev.feedback.length > 80 ? "..." : ""}"
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* METRICS TAB */}
        {activeTab === "metrics" && (
          <div>
            <div style={{
              fontSize: 11, color: "#546E7A", letterSpacing: 1,
              marginBottom: 20, paddingBottom: 12,
              borderBottom: "1px solid #1B3A5C",
            }}>
              EVALUATION METRICS DASHBOARD
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total Evaluations", value: evaluations.length, icon: "📊", color: "#F0B429" },
                { label: "Response A Wins", value: evaluations.filter(e => e.winner === "A").length, icon: "🔵", color: "#1E88E5" },
                { label: "Response B Wins", value: evaluations.filter(e => e.winner === "B").length, icon: "🟣", color: "#8E24AA" },
                { label: "Tied Evaluations", value: evaluations.filter(e => e.winner === "TIE").length, icon: "⚖️", color: "#43A047" },
                { label: "Avg Score A", value: evaluations.length ? (evaluations.reduce((a, e) => a + e.scoreA, 0) / evaluations.length).toFixed(1) : "—", icon: "⭐", color: "#1E88E5" },
                { label: "Avg Score B", value: evaluations.length ? (evaluations.reduce((a, e) => a + e.scoreB, 0) / evaluations.length).toFixed(1) : "—", icon: "⭐", color: "#8E24AA" },
              ].map((m, i) => (
                <div key={i} style={{
                  background: "#0D1B2A",
                  border: "1px solid #1B3A5C",
                  borderRadius: 12,
                  padding: "20px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: m.color, marginBottom: 4 }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: "#546E7A", letterSpacing: 1 }}>{m.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
            {evaluations.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px",
                background: "#0D1B2A", border: "1px solid #1B3A5C",
                borderRadius: 12, color: "#546E7A", fontSize: 12,
              }}>
                Submit evaluations to see metrics here →{" "}
                <span style={{ color: "#F0B429", cursor: "pointer" }}
                  onClick={() => setActiveTab("evaluate")}>Start Evaluating</span>
              </div>
            ) : (
              <div style={{
                background: "#0D1B2A",
                border: "1px solid #1B3A5C",
                borderRadius: 12,
                padding: "20px 24px",
              }}>
                <div style={{ fontSize: 11, color: "#546E7A", letterSpacing: 1, marginBottom: 14 }}>
                  PER-CRITERIA AVERAGE SCORES
                </div>
                {CRITERIA.map(c => {
                  const avgA = evaluations.length
                    ? (evaluations.reduce((acc, e) => acc + (e.criteria.A[c.id] || 0), 0) / evaluations.length).toFixed(1)
                    : 0;
                  const avgB = evaluations.length
                    ? (evaluations.reduce((acc, e) => acc + (e.criteria.B[c.id] || 0), 0) / evaluations.length).toFixed(1)
                    : 0;
                  return (
                    <div key={c.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "#90A4AE" }}>{c.icon} {c.label}</span>
                        <span style={{ fontSize: 11, color: "#546E7A" }}>
                          A: <b style={{ color: "#90CAF9" }}>{avgA}</b> &nbsp;
                          B: <b style={{ color: "#CE93D8" }}>{avgB}</b>
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <div style={{ flex: 1 }}>
                          <ScoreBar score={parseFloat(avgA)} color="#1565C0" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <ScoreBar score={parseFloat(avgB)} color="#7B1FA2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid #1B3A5C",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "#2A3A4A",
          letterSpacing: 1,
        }}>
          <span>RLHF EVALUATION PLATFORM — Built by Ashok Kumar Dandu</span>
          <span>Data Engineer • AI Trainer • 1.5 yrs LLM Evaluation Experience</span>
        </div>
      </div>
    </div>
  );
}
