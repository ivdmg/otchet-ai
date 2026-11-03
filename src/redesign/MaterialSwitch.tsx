import React from 'react';
export function MaterialSwitch({checked,disabled,onChange}:{checked:boolean;disabled?:boolean;onChange:(value:boolean)=>void}){
  return <label className="materials-toggle">
    <span><b>Таблицы, формулы и код</b><small>+10% к стоимости. Таблица включена, формулы и код — где уместно. Всё входит в выбранный объём.</small></span>
    <input type="checkbox" role="switch" aria-label="Добавить таблицы, формулы и код" checked={checked} disabled={disabled} onChange={e=>onChange(e.target.checked)}/>
  </label>;
}
