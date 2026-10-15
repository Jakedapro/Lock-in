/* ===== Lock In — official HSC past papers (links only) =====
   The papers and marking guidelines belong to NESA and open from their website; nothing from them is
   copied here. FORMAT is each paper's structure (marks per section/question and timing) for the
   timer and the mark sheet. Links collected from nsw.gov.au/…/hsc-exam-papers. */
const PAPERS = (() => {
  const LIST = {
 "y12": [
  {
   "year": 2025,
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-10/2025-hsc-maths-extension-2.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-11/2025-hsc-maths-extension-2-mg.pdf",
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-12/2025-hsc-maths-ext-2-marking-feedback-section-ii.pdf"
  },
  {
   "year": 2024,
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2024-hsc-mathematics-ext2-marking-feedback.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2024-hsc-maths-ext-2-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2024-hsc-maths-ext-2.pdf"
  },
  {
   "year": 2023,
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2023-hsc-mathematics-ext2-marking-feedback.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2023-hsc-maths-ext-2-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2023-hsc-maths-ext-2.pdf"
  },
  {
   "year": 2022,
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2022-hsc-mathematics-extension-2.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2022-hsc-maths-ext-2-mg.pdf",
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2022-mathematics-extension-2-hsc-marking-feedback.pdf"
  },
  {
   "year": 2021,
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2021-hsc-mathematics-extension-2-marking-feedback.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2021-hsc-mathematics-extension-2.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2021-hsc-maths-ext-2-mg.pdf"
  },
  {
   "year": 2020,
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2020-hsc-mathematics-ext-2-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2020-hsc-mathematics-extension-2.pdf",
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2020-mathematics-extension-2-hsc-marking-feedback.pdf"
  }
 ],
 "e1": [
  {
   "year": 2025,
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-10/2025-hsc-maths-extension-1.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-11/2025-hsc-maths-extension-1-mg.pdf",
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-12/2025-hsc-maths-ext-1-marking-feedback-section-ii.pdf"
  },
  {
   "year": 2024,
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2024-hsc-mathematics-ext1-marking-feedback.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2024-hsc-maths-ext-1-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2024-hsc-maths-ext-1.pdf"
  },
  {
   "year": 2023,
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2023-hsc-mathematics-ext1-marking-feedback.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2023-hsc-maths-ext-1-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2023-hsc-maths-ext-1.pdf"
  },
  {
   "year": 2022,
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2022-hsc-mathematics-ext1-marking-feedback.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2022-hsc-mathematics-extension-1.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2022-hsc-maths-ext-1-mg.pdf"
  },
  {
   "year": 2021,
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2021-hsc-mathematics-extension-1-marking-feedback.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2021-hsc-mathematics-extension-1.pdf",
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2021-hsc-maths-ext-1-mg.pdf"
  },
  {
   "year": 2020,
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2020-hsc-mathematics-ext-1-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2020-hsc-mathematics-extension-1.pdf",
   "feedback": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2020-mathematics-extension-1-hsc-marking-feedback.pdf"
  }
 ],
 "phys": [
  {
   "year": 2025,
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-11/2025-hsc-physics-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-11/2025-hsc-physics.pdf"
  },
  {
   "year": 2024,
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2024-hsc-physics-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-09/2024-hsc-physics.pdf"
  },
  {
   "year": 2023,
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2023-hsc-physics-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2023-hsc-physics.pdf"
  },
  {
   "year": 2022,
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2022-hsc-physics-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2022-hsc-physics.pdf"
  },
  {
   "year": 2021,
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2021-hsc-physics-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2021-hsc-physics.pdf"
  },
  {
   "year": 2020,
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2020-hsc-physics-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2020-hsc-physics.pdf"
  },
  {
   "year": 2019,
   "mg": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2019-hsc-physics-mg.pdf",
   "paper": "https://www.nsw.gov.au/sites/default/files/noindex/2025-05/2019-hsc-physics.pdf"
  }
 ]
};
  const FORMAT = {"y12": {"name": "Maths Extension 2", "reading": 10, "writing": 180, "parts": [["I", "Section I: multiple choice", 10], ["Q11", "Question 11", 15], ["Q12", "Question 12", 15], ["Q13", "Question 13", 15], ["Q14", "Question 14", 15], ["Q15", "Question 15", 15], ["Q16", "Question 16", 15]]}, "e1": {"name": "Maths Extension 1", "reading": 10, "writing": 120, "parts": [["I", "Section I: multiple choice", 10], ["Q11", "Question 11", 15], ["Q12", "Question 12", 15], ["Q13", "Question 13", 15], ["Q14", "Question 14", 15]]}, "phys": {"name": "Physics", "reading": 5, "writing": 180, "parts": [["I", "Section I: multiple choice", 20], ["II", "Section II: short answers and extended responses", 80]]}};
  const PAGE = { y12: 'mathematics-extension-2', e1: 'mathematics-extension-1', phys: 'physics' };
  const pageUrl = (sid, year) => `https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/${PAGE[sid]}/${year}`;
  const outOf = (sid) => FORMAT[sid].parts.reduce((a, p) => a + p[2], 0);
  return { LIST, FORMAT, pageUrl, outOf };
})();
if (typeof module !== 'undefined') module.exports = PAPERS;
