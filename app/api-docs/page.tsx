"use client"

import React from 'react';

import { API } from '@stoplight/elements';
import '@stoplight/elements/styles.min.css';


function ApiDocPage() {
  return (
    <div className="App">
      <API
        apiDescriptionUrl="@/openapi.yaml"
      />
    </div>
  );
}

export default ApiDocPage;