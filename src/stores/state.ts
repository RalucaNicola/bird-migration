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

import { action, makeObservable, observable } from "mobx";

export interface Error {
    name: string | null;
    message: string | null;
}

class State {
    viewLoaded: boolean = false
    error: Error = null

    constructor() {
        makeObservable(this, {
            viewLoaded: observable,
            setViewLoaded: action,
            error: observable,
            setError: action
        })
    }

    setViewLoaded() {
        this.viewLoaded = true;
    }

    setError({ name, message }: Error) {
        if (name && message) {
            this.error = {
                name, message
            }
        } else {
            this.error = null;
        }

    }

}

const state = new State();
export default state;