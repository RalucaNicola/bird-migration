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

import '@esri/calcite-components/dist/components/calcite-alert';
import state from '../../stores/state';
import { observer } from 'mobx-react-lite';

export const ErrorAlert = observer(() => {
  const { error } = state;
  if (error && error.name && error.message) {
    return (
      <calcite-alert icon='rangefinder' kind='danger' open label='Loading error' placement='bottom-end'>
        <div slot='title'>{error.name}</div>
        <div slot='message'>{error.message}</div>
      </calcite-alert>
    );
  } else {
    return null;
  }
});
