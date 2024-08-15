"use client";
import React from "react";
import "@stoplight/elements/styles.min.css";
import dynamic from "next/dynamic";
import PageContainer from "@/components/layout/page-container";
const API = dynamic(() => import("@stoplight/elements").then((x) => x.API), {
  ssr: false,
});

function ApiDocPage() {
  return (
    <PageContainer scrollable>
      <div className="App">
        <API apiDescriptionUrl="https://raw.githubusercontent.com/plutack/scissor/main/scissor-v1.yaml" />
      </div>
    </PageContainer>
  );
}

export default ApiDocPage;
