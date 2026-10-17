import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import {
  LIKERT_LABELS,
  MINDSET_VIOLATION_LABELS,
  type MindsetAssessmentRow,
  type MindsetPerQuestionResult,
  type MindsetScores,
  type MindsetSubmitReason,
} from "@/lib/mindset/types";
import { CATEGORY_LABELS, REASON_LABELS } from "@/lib/mindset/labels";

// One A4 report per candidate, attached to the recruiter email. Ported from
// gads/pdf.tsx, which is the proven version of this. @react-pdf/renderer has
// its own styling system, fully separate from Tailwind, so styles.css tokens
// don't reach here and the brand palette is re-declared as literals.
//
// Page 1 is the summary a reviewer skims: score, timing, proctoring, then
// the trait breakdown. Page 2 is everything they actually have to read, the
// written answers in full, kept separate so page 1 stays printable on its
// own.

const BRAND_RED = "#c0272d";
const INK = "#1a1a1a";
const MUTED = "#6b7280";
const BORDER = "#e5e5e5";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: INK, fontFamily: "Helvetica" },
  eyebrow: { fontSize: 9, color: BRAND_RED, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 10, color: MUTED, marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 5,
  },
  cell: { flex: 1 },
  label: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: { fontSize: 11, fontWeight: 700 },
  scoreBadge: {
    alignSelf: "flex-start",
    backgroundColor: BRAND_RED,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    color: MUTED,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  writtenBlock: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 4,
  },
  note: { fontSize: 8, color: MUTED, marginTop: 10, lineHeight: 1.4 },
});

function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "Unknown";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/** What the candidate actually chose, in words rather than an index, so the
 * reviewer never has to decode a number. */
function answerText(row: MindsetAssessmentRow, result: MindsetPerQuestionResult): string {
  const question = row.questions.find((q) => q.id === result.questionId);
  const entry = row.answers[String(result.questionId)];
  if (!question || !entry || entry.skipped || entry.value === null) return "Skipped";

  if (question.mechanic === "likert") {
    return typeof entry.value === "number" ? (LIKERT_LABELS[entry.value] ?? "Unknown") : "Skipped";
  }
  if (question.mechanic === "situational") {
    return typeof entry.value === "number"
      ? (question.options[entry.value] ?? "Unknown")
      : "Skipped";
  }
  return "See written answers";
}

export async function buildMindsetReportPdf(
  row: MindsetAssessmentRow,
  scores: MindsetScores,
  perQuestion: MindsetPerQuestionResult[],
  reason: MindsetSubmitReason,
  timeTakenSeconds: number | null,
): Promise<Buffer> {
  const violationCounts = new Map<string, number>();
  for (const v of row.violations) {
    violationCounts.set(v.type, (violationCounts.get(v.type) ?? 0) + 1);
  }

  const writtenQuestions = row.questions.filter((q) => q.mechanic === "written");
  const scored = perQuestion.filter((p) => p.mechanic !== "written");
  const skippedCount = scored.filter((p) => p.skipped).length;

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>MINDSET &amp; FIT ASSESSMENT - ETHIXWEB</Text>
        <Text style={styles.title}>{row.candidate_name}</Text>
        <Text style={styles.subtitle}>
          {row.candidate_email} · {row.candidate_phone} · {row.candidate_college}
        </Text>

        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.label}>Overall fit score</Text>
            <Text style={styles.scoreBadge}>{scores.overallPercent}%</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Time taken</Text>
            <Text style={styles.value}>{formatDuration(timeTakenSeconds)}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Questions skipped</Text>
            <Text style={styles.value}>
              {skippedCount} of {scored.length}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.label}>Submitted</Text>
            <Text style={styles.value}>
              {row.submitted_at ? new Date(row.submitted_at).toLocaleString("en-US") : "-"}
            </Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>How it ended</Text>
            <Text style={styles.value}>{REASON_LABELS[reason]}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Proctoring events</Text>
            <Text style={styles.value}>{row.violations.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Trait breakdown</Text>
        <View style={styles.tableHeader}>
          <Text style={{ flex: 3 }}>Category</Text>
          <Text style={{ flex: 1 }}>Points</Text>
          <Text style={{ flex: 1 }}>Percent</Text>
        </View>
        {Object.entries(scores.byCategory).map(([category, s]) => (
          <View style={styles.tableRow} key={category}>
            <Text style={{ flex: 3 }}>{CATEGORY_LABELS[category] ?? category}</Text>
            <Text style={{ flex: 1 }}>
              {s.earned}/{s.max}
            </Text>
            <Text style={{ flex: 1 }}>{s.percent === null ? "n/a" : `${s.percent}%`}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Proctoring summary</Text>
        {row.violations.length === 0 ? (
          <Text>No violations recorded.</Text>
        ) : (
          Array.from(violationCounts.entries()).map(([type, count]) => (
            <View style={styles.tableRow} key={type}>
              <Text style={{ flex: 3 }}>
                {MINDSET_VIOLATION_LABELS[type as keyof typeof MINDSET_VIOLATION_LABELS] ?? type}
              </Text>
              <Text style={{ flex: 1 }}>{count}</Text>
            </View>
          ))
        )}

        <Text style={styles.note}>
          Scores are fit signals, not right or wrong answers. Half the agreement statements are
          reverse scored, so agreeing with everything without reading lands near 50 percent rather
          than full marks. Treat this as one input for a human decision, never as a pass mark.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>ANSWER DETAIL</Text>
        <Text style={styles.title}>{row.candidate_name}</Text>
        <Text style={styles.subtitle}>Every scored question, with what they chose.</Text>

        <View style={styles.tableHeader}>
          <Text style={{ flex: 0.5 }}>#</Text>
          <Text style={{ flex: 2 }}>Category</Text>
          <Text style={{ flex: 3.5 }}>Their answer</Text>
          <Text style={{ flex: 0.8 }}>Time</Text>
          <Text style={{ flex: 0.8 }}>Pts</Text>
        </View>
        {scored.map((q) => (
          <View style={styles.tableRow} key={q.questionId} wrap={false}>
            <Text style={{ flex: 0.5 }}>{q.questionId}</Text>
            <Text style={{ flex: 2 }}>{CATEGORY_LABELS[q.category] ?? q.category}</Text>
            <Text style={{ flex: 3.5 }}>{answerText(row, q)}</Text>
            <Text style={{ flex: 0.8 }}>{q.elapsedSeconds}s</Text>
            <Text style={{ flex: 0.8 }}>{q.max > 0 ? `${q.earned}/${q.max}` : "-"}</Text>
          </View>
        ))}
      </Page>

      {writtenQuestions.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.eyebrow}>WRITTEN ANSWERS</Text>
          <Text style={styles.title}>{row.candidate_name}</Text>
          <Text style={styles.subtitle}>
            Never auto scored. These are for you to read and judge.
          </Text>
          {writtenQuestions.map((q) => {
            const entry = row.answers[String(q.id)];
            const text = typeof entry?.value === "string" ? entry.value.trim() : "";
            return (
              <View style={styles.writtenBlock} key={q.id} wrap={false}>
                <Text style={{ fontSize: 8, color: BRAND_RED, fontWeight: 700, marginBottom: 4 }}>
                  Q{q.id} · {entry?.elapsedSeconds ?? 0}s spent
                </Text>
                <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>{q.question}</Text>
                <Text style={{ fontSize: 10 }}>{text || "No answer submitted."}</Text>
              </View>
            );
          })}
        </Page>
      )}
    </Document>
  );

  return renderToBuffer(doc);
}
