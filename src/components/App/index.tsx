/* Copyright 2025 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ErrorAlert } from '../ErrorAlert';
import { Identity } from '../Identity';
import { Map } from '../Map';
import { Timeline } from '../Timeline';

const App = () => {
  return (
    <>
      <Map></Map>
      <Identity></Identity>
      <ErrorAlert></ErrorAlert>
      <Timeline></Timeline>
    </>
  );
};

export default App;
