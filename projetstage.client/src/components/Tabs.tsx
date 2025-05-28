import React from "react";

interface TabsProps {
  activeTab: number;
  setActiveTab: (idx: number) => void;
  labels: string[];
}

export default function Tabs({ activeTab, setActiveTab, labels }: TabsProps) {
  return (
    <div className="flex flex-row-reverse w-full">
      {labels.map((l, idx) => (
        <div
          key={l}
          className={`gov-tab ${activeTab === idx ? "gov-tab-active" : ""}`}
          onClick={() => setActiveTab(idx)}
        >
          {l}
        </div>
      ))}
    </div>
  );
}
