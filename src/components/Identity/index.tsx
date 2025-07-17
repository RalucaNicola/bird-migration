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

/// <reference types="@esri/calcite-components/dist/types/react" />
import styles from './Identity.module.css';
import '@esri/calcite-components/dist/components/calcite-avatar';
import '@esri/calcite-components/dist/components/calcite-button';
import { motion } from 'motion/react';

import { useState } from 'react';
import auth from '../../stores/authentication';
import { observer } from 'mobx-react-lite';

export const Identity = observer(() => {
  const [open, setOpen] = useState(false);
  const { signedIn, userName, fullName, thumbnailUrl } = auth.userInfo;

  const toggleIdentityMenu = () => {
    setOpen(!open);
  };

  const opacity = open && signedIn ? 1 : 0;

  return (
    <div className={styles.identity}>
      {!signedIn ? (
        <calcite-button appearance='solid' onClick={() => auth.signIn()}>
          Sign in
        </calcite-button>
      ) : (
        <calcite-avatar
          className={styles.avatar}
          fullName={fullName}
          username={userName}
          thumbnail={thumbnailUrl}
          scale='m'
          onClick={toggleIdentityMenu}
        ></calcite-avatar>
      )}
      <motion.div className={styles.identityMenu} animate={{ opacity }}>
        <div className={styles.userInfo}>
          <calcite-avatar fullName={fullName} username={userName} thumbnail={thumbnailUrl} scale='l'></calcite-avatar>
          <div>
            <p className={styles.userTitle}>{fullName}</p>
            <p>{userName}</p>
          </div>
        </div>
        <calcite-button width='full' onClick={() => auth.signOut()}>
          Sign out
        </calcite-button>
      </motion.div>
    </div>
  );
});
