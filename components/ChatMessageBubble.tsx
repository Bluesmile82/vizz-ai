import { useState } from "react";
import type { Message } from "ai/react";
import { VegaLite } from 'react-vega'
import { Error, Spec } from "vega";
export function ChatMessageBubble(props: { message: Message, aiEmoji?: string }) {
  const [openSpec, setOpenSpec] = useState(true);
  const colorClassName =
    props.message.role === "user" ? "bg-sky-600" : "bg-slate-50 text-black";
  const alignmentClassName =
    props.message.role === "user" ? "mr-auto" : "ml-auto";
  const prefix = props.message.role === "user" ? "🧑" : props.aiEmoji;
  const { content } = props.message;

  const handleError = (reason: Error, description: Spec['description']) => {
    console.log('error to fix in chart', description, reason);
    // Do something with the view, such as updating the value of a signal.
    // view.signal('xDomain', [props.xMin, props.xMax]).run();
  };

  try {
    const JSONContent = JSON.parse(content);
    if (JSONContent.type === "vega") {
      const spec = JSONContent.response;
      const specObject = JSON.parse(spec);

      return (
        <div
          className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
        >
          <div className="mr-2">
            {prefix}
          </div>
          <div className="whitespace-pre-wrap">
            <VegaLite spec={{
              ...spec, width: 400,
              height: 200,
              padding: 5
            }} data={specObject.data} onError={(e) => handleError(e, specObject?.description)} />

            <div>
              <button type="button" onClick={() => setOpenSpec(!openSpec)} className="text-xs">
                <span className={`inline-block transform ${openSpec && 'rotate-180'}`} >&#9660;</span> {openSpec ? 'Close' : 'Open'} Spec
              </button>
            </div>
            {openSpec && <div className="text-xs">{spec}</div>}
          </div>
        </div>
      );
    }
  }
  catch (e) { }
  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="mr-2">
        {prefix}
      </div>
      <div className="whitespace-pre-wrap">
        {props.message.content}
      </div>
    </div>
  );
}