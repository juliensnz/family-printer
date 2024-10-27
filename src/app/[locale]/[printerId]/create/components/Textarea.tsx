'use client';

import {ChangeEventHandler, useEffect, useRef} from 'react';

const useAutosizeTextArea = (textAreaRef: HTMLTextAreaElement | null, value: string) => {
  useEffect(() => {
    if (textAreaRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.style.height = '0px';
      const scrollHeight = textAreaRef.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);
};

const Textarea = ({
  placeholder,
  name,
  value,
  onChange,
}: {
  placeholder: string;
  name: string;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(ref.current, value);

  return (
    <textarea
      name={name}
      className="outline-none w-full text-base touch-manipulation mb-4"
      style={{resize: 'none', fontSize: '16px !important'}}
      ref={ref}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
  );
};

export {Textarea};
