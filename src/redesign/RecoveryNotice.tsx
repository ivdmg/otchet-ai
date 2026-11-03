import React, {useEffect,useState} from 'react';
import {AlertCircle,Clock3,RefreshCw,ArrowLeft,X} from 'lucide-react';
import {ChromeButton} from './Chrome';

type Props={job?:any;order?:any;networkLost?:boolean;error?:string;busy:boolean;hasPlan?:boolean;
  onRetry:()=>void;onRefresh:()=>void;onCancel:()=>void;onRestart:()=>void;onBack:()=>void;onNew:()=>void};

export function RecoveryNotice({job,order,networkLost,error,busy,hasPlan,onRetry,onRefresh,onCancel,onRestart,onBack,onNew}:Props){
  const info=job?.recovery;
  const [clock,setClock]=useState(()=>Date.now()/1000);
  const waiting=job?.status==='retry';
  const until=waiting?job?.retry_at:info?.retry_available_at;
  useEffect(()=>{if(!until)return;const timer=setInterval(()=>setClock(Date.now()/1000),1000);return()=>clearInterval(timer);},[until]);
  if(!networkLost&&!error&&!info?.stopped&&!info?.stalled&&!waiting)return null;
  const seconds=Math.max(0,Math.ceil((until||0)-clock));
  const title=networkLost?'Не получаем обновления':waiting?'Ожидаем повторной попытки':job?.kind==='plan'?'Не удалось подготовить план':'Подготовка остановлена';
  const message=networkLost?'Связь с сервером прервалась. Заказ может продолжать выполняться. Проверьте статус перед повторной отправкой.':
    error || (job?.kind==='plan'&&hasPlan&&info?.stopped?'Новая версия плана не получена. Предыдущий план сохранён — его можно использовать.':info?.message) || 'Ваши настройки сохранены.';
  let payment='';
  if(order?.state==='bonus_released')payment='Зарезервированные кредиты возвращены на баланс.';
  else if(order?.state==='simulated_refund')payment='Тестовый заказ отменён. Реальные деньги не списывались.';
  else if(['refund_pending','refund_attention'].includes(order?.state))payment='Возврат по заказу оформляется. Повторная оплата сейчас не требуется.';
  else if(job?.status==='paused')payment='Заказ сохранён на 24 часа. Продолжение не требует повторной оплаты. При отмене или истечении паузы будет оформлен возврат или освобождены кредиты.';
  return <section className={`recovery-notice ${waiting?'is-waiting':''}`} role={waiting?'status':'alert'} aria-live="polite">
    <div className="recovery-notice-heading">{waiting?<Clock3 size={21}/>:<AlertCircle size={21}/>}<h3>{title}</h3></div>
    <p>{message}</p>
    {seconds>0&&<p className="recovery-timing">{seconds<120?`Повтор будет доступен через ${seconds} сек.`:`Повтор будет доступен после ${new Date((until||0)*1000).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}.`}{waiting?' Продолжим автоматически.':''}</p>}
    {payment&&<p>{payment}</p>}
    <div className="recovery-actions">
      {networkLost||info?.stalled?<ChromeButton type="button" className="button button-outline" disabled={busy} onClick={onRefresh}><RefreshCw size={16}/>Проверить статус</ChromeButton>:
        (info?.can_retry||(!job&&error))&&<ChromeButton type="button" className="button button-outline" disabled={busy||seconds>0} onClick={onRetry}><RefreshCw size={16}/>{job?.kind==='document'?'Продолжить без повторной оплаты':'Повторить попытку'}</ChromeButton>}
      {info?.can_restart&&!info?.can_retry&&<ChromeButton type="button" className="button button-outline" disabled={busy} onClick={onRestart}>Использовать сохранённый план</ChromeButton>}
      {(info?.stopped||job?.status==='completed')&&!info?.can_retry&&!info?.can_restart&&!hasPlan&&<ChromeButton type="button" className="button button-outline" disabled={busy} onClick={onNew}>Новый черновик с этими параметрами</ChromeButton>}
      <ChromeButton type="button" className="button button-outline" disabled={busy} onClick={onBack}><ArrowLeft size={16}/>К параметрам</ChromeButton>
      {info?.can_cancel&&<ChromeButton type="button" className="text-button" disabled={busy} onClick={onCancel}><X size={15}/>Отменить подготовку</ChromeButton>}
    </div>
    {info?.stopped&&info?.retries_left===0&&<small>Лимит повторных попыток для этого запуска исчерпан. Можно отменить заказ или вернуться к параметрам.</small>}
  </section>;
}
