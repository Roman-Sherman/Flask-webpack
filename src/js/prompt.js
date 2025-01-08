function enhancePromptSummarization(userText) {
  const prompt = userText + promptUniqueIndex++;
  const selectedSummarize = document.getElementById("prompt-summarize").value;

  if (selectedSummarize === "expended") {
    return `Make the summary more detailed. ${prompt} Expend it with up to at least 100 words.`;
  } else if (selectedSummarize === "shorter") {
    return `Make the summary shorter. ${prompt}. Should be a couple of lines about the main subject.`;
  }
}

function enhancePromptImageGen(userText) {
  let promptUniqueIndex = 1;
  const prompt = userText + promptUniqueIndex++;
  const selectedStyle = document.getElementById("prompt-style").value;
  if (selectedStyle === "detailed") {
    return `An ultra-detailed, high-resolution image of ${prompt}. The image should be sharp, lifelike, with intricate textures, vivid colors, and a perfect representation of every aspect of the subject. The lighting should be natural, and the image should evoke realism with a unique, artistic feel.`;
  } else if (selectedStyle === "animated") {
    return `A vibrant, animated-style illustration of ${prompt}. This image should feature bold, exaggerated elements, playful colors, and a unique flair that captures the subject in a fun, dynamic, and stylized way. Focus on smooth lines, vivid contrast, and a sense of motion or personality in the image.`;
  } else if (selectedStyle === "sketch") {
    return `A finely detailed, pencil sketch of ${prompt}. This image should emphasize clean lines, intricate shading, and realistic proportions, creating a hand-drawn feel. The focus should be on texture and form, giving the subject a timeless, artistic quality.`;
  } else if (selectedStyle === "abstract") {
    return `An abstract interpretation of ${prompt}. Use bold colors, unconventional shapes, and fluid composition to convey the essence of the subject rather than its literal form. The image should be expressive, artistic, and evoke emotions through color and form rather than detail.`;
  } else if (selectedStyle === "vintage") {
    return `A vintage-style image of ${prompt}, with faded tones, sepia or black-and-white coloring, and a nostalgic, retro feel. The subject should evoke an old-time aesthetic with delicate textures, creating the feel of a classic photograph or illustration.`;
  } else if (selectedStyle === "cyberpunk") {
    return `A high-tech, futuristic cyberpunk-style image of ${prompt}. Focus on neon lights, dark urban environments, and a gritty, dystopian aesthetic with technological elements like holograms or robotic details. The image should be bold, edgy, and evoke a futuristic atmosphere.`;
  } else if (selectedStyle === "minimalist") {
    return `A minimalist representation of ${prompt}. Use simple lines, geometric shapes, and limited colors to create a clean and modern look. The image should focus on simplicity and elegance, with minimal detail, allowing the essence of the subject to shine through.`;
  } else if (selectedStyle === "watercolor") {
    return `A delicate watercolor painting of ${prompt}. The image should have soft edges, fluid blending of colors, and a gentle, organic feel. Focus on the lightness of touch and subtle color gradients, giving the image an artistic, flowing quality.`;
  } else if (selectedStyle === "low-poly") {
    return `A low-poly, geometric representation of ${prompt}. The image should consist of sharp, angular shapes with vibrant color blocks, emphasizing form and structure over fine detail. This style should create a unique, modern interpretation of the subject.`;
  }
}
