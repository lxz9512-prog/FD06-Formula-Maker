import { ChevronRight } from 'lucide-react';
import './page-navigation.css';

/** Shared back glyph; navigation handlers stay with their owning pages. */
export function PageBackIcon() {
  return <ChevronRight aria-hidden="true" className="h-6 w-6 rotate-180" style={{ color: '#221122' }} />;
}
