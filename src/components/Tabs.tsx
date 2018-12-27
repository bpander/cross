import React from 'react';

export interface Tab {
  label: JSX.Element | string;
  panel: () => JSX.Element | string;
}

interface TabsProps {
  tabs: Tab[];
  active: number;
  onChange: (index: number) => void;
}

const Tabs: React.SFC<TabsProps> = props => (
  <div className="tabs">
    <div className="tabs__list">
      {props.tabs.map((tab, i) => (
        <button key={i} className="tabs__trigger" onClick={() => props.onChange(i)}>
          {tab.label}
        </button>
      ))}
    </div>
    <div className="tabs__panel">
      {props.tabs[props.active] && props.tabs[props.active].panel()}
    </div>
  </div>
);

export default Tabs;
