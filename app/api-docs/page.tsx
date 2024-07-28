"use client"
import React from 'react';

import '@stoplight/elements/styles.min.css';4

import dynamic from "next/dynamic";
const API = dynamic(() => import("@stoplight/elements").then((x) => x.API), { ssr: false });


function ApiDocPage() {
  return (
    <div className="App">
      <API
        apiDescriptionUrl="./openapi."
      />
    </div>
  );
}

export default ApiDocPage;