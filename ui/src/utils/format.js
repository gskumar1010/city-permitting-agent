export function interleavedToPlainText(content) {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.type === 'text') return item.text ?? '';
        if (item?.type === 'tool_call') return `[tool:${item.tool_name || 'call'}]`;
        return '';
      })
      .join('');
  }
  if (content?.type === 'text') {
    return content.text ?? '';
  }
  if (content?.type === 'tool_call') {
    return `[tool:${content.tool_call?.name ?? 'call'}]`;
  }
  return '';
}

export function createSamplingParams({ temperature, topP, maxTokens, repetitionPenalty }) {
  const strategy = temperature > 0 ? { type: 'top_p', temperature, top_p: topP } : { type: 'greedy' };
  return {
    strategy,
    max_tokens: maxTokens,
    repetition_penalty: repetitionPenalty,
  };
}
