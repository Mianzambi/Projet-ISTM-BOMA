"use client";

import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555555", marginBottom: 20 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingBottom: 6,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    paddingVertical: 6,
  },
  cellMatiere: { flex: 3 },
  cellCredits: { flex: 1, textAlign: "center" },
  cellNote: { flex: 1, textAlign: "right" },
  total: { marginTop: 20, fontSize: 12, textAlign: "right" },
});

function BulletinDocument({ studentName, filiere, niveau, resultats, moyenne }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>ISTM/BOMA — Relevé de notes</Text>
        <Text style={styles.subtitle}>
          {studentName} — {niveau} {filiere}
        </Text>

        <View style={styles.headerRow}>
          <Text style={styles.cellMatiere}>Matière</Text>
          <Text style={styles.cellCredits}>Crédits</Text>
          <Text style={styles.cellNote}>Note</Text>
        </View>

        {resultats.map((r) => (
          <View style={styles.row} key={r.id}>
            <Text style={styles.cellMatiere}>{r.matiere}</Text>
            <Text style={styles.cellCredits}>{r.credits ?? "—"}</Text>
            <Text style={styles.cellNote}>{r.note ?? "—"}</Text>
          </View>
        ))}

        <Text style={styles.total}>Moyenne générale : {moyenne}</Text>
      </Page>
    </Document>
  );
}

export default function BulletinDownload({ studentName, filiere, niveau, resultats }) {
  if (!resultats || resultats.length === 0) {
    return (
      <p className="text-xs text-slate-400">
        Aucun résultat n'a encore été publié pour l'instant.
      </p>
    );
  }

  const notesValides = resultats.filter((r) => r.note !== null && r.note !== undefined);
  const moyenne =
    notesValides.length > 0
      ? (
          notesValides.reduce((sum, r) => sum + Number(r.note), 0) / notesValides.length
        ).toFixed(2)
      : "—";

  return (
    <PDFDownloadLink
      document={
        <BulletinDocument
          studentName={studentName}
          filiere={filiere}
          niveau={niveau}
          resultats={resultats}
          moyenne={moyenne}
        />
      }
      fileName="bulletin-isc-boma.pdf"
      className="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
    >
      {({ loading }) => (loading ? "Préparation du PDF…" : "Télécharger mon bulletin (PDF)")}
    </PDFDownloadLink>
  );
}
