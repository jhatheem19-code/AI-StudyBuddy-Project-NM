function parseGeminiJson(text) {
  const raw = String(text || "").trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced ? fenced[1].trim() : raw;
  const firstArray = source.indexOf("[");
  const firstObject = source.indexOf("{");
  let start = -1;

  if (firstArray >= 0 && firstObject >= 0) start = Math.min(firstArray, firstObject);
  else start = Math.max(firstArray, firstObject);

  const end = Math.max(source.lastIndexOf("]"), source.lastIndexOf("}"));
  const candidate = start >= 0 && end >= start ? source.slice(start, end + 1) : source;
  return JSON.parse(candidate);
}

module.exports = parseGeminiJson;
