/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import RedecoratorApp from './components/RedecoratorApp';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <RedecoratorApp />
      <Toaster position="top-center" theme="dark" />
    </>
  );
}
