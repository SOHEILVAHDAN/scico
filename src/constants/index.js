import SketchPlan from '../components/sketches/SketchPlan.jsx';
import SketchSection from '../components/sketches/SketchSection.jsx';
import SketchAxo from '../components/sketches/SketchAxo.jsx';
import SketchConcept from '../components/sketches/SketchConcept.jsx';

/**
 * Language independent data: which drawing represents each project, sheet
 * numbering, contact details. All prose lives in `src/i18n/translations/*`
 * and is merged in by the helpers at the bottom of this file.
 */

export const navLinks = [
  { id: 1, key: 'index', href: '#index' },
  { id: 2, key: 'work', href: '#work' },
  { id: 3, key: 'process', href: '#process' },
  { id: 4, key: 'studio', href: '#studio' },
  { id: 5, key: 'contact', href: '#contact' },
];

export const socialLinks = [
  { id: 1, name: 'Instagram', href: 'https://instagram.com/sahistudio' },
  { id: 2, name: 'Archdaily', href: 'https://archdaily.com' },
  { id: 3, name: 'LinkedIn', href: 'https://linkedin.com' },
];

export const studioContact = {
  email: 'studio@sahi.archi',
  phone: '+98 21 2205 4400',
};

/** Each project is represented by the drawing type that best explains it. */
const projectAssets = [
  { id: 'courtyard', sketch: SketchPlan, sheet: 'A-101 · GROUND FLOOR PLAN', scale: '1:100' },
  { id: 'library', sketch: SketchSection, sheet: 'A-201 · LONG SECTION', scale: '1:100' },
  { id: 'terraces', sketch: SketchAxo, sheet: 'A-301 · EXPLODED AXONOMETRIC', scale: 'NTS' },
  { id: 'pavilion', sketch: SketchConcept, sheet: 'A-001 · CONCEPT DIAGRAM', scale: 'NTS' },
];

const processAssets = [
  { id: 1, sketch: SketchConcept },
  { id: 2, sketch: SketchSection },
  { id: 3, sketch: SketchPlan },
  { id: 4, sketch: SketchAxo },
];

/** Merge translated copy with the static definitions above. */
const zip = (assets, copy = []) => assets.map((asset, index) => ({ ...asset, ...(copy[index] ?? {}) }));

export const getProjects = (t) => zip(projectAssets, t.work.items);
export const getProcessSteps = (t) => zip(processAssets, t.process.steps);
