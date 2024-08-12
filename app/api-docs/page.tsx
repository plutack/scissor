"use client";
import React from "react";
import "@stoplight/elements/styles.min.css";
import dynamic from "next/dynamic";
import PageContainer from "@/components/layout/page-container";
const API = dynamic(() => import("@stoplight/elements").then((x) => x.API), {
  ssr: false,
});

// link https://raw.githubusercontent.com/plutack/link-slice/main/openapi.yaml
function ApiDocPage() {
  return (
    <PageContainer scrollable>
      <div className="App">
        <API apiDescriptionUrl="https://raw.githubusercontent.com/plutack/nextjsauth-template/main/openapi.yaml" />
      </div>
    </PageContainer>
  );
}

export default ApiDocPage;
