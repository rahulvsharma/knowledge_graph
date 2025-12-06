# NLP Assignment 1 - PS 10: Part B Literature Survey: Advancements in Retrieval-Augmented Generation for Knowledge-Enhanced Language Models

### Group ID: 61

### Group Members Name with Student ID:

1. Arpita Singh (2024AA05027) Contribution 100%
2. Rahul Sharma (2024AA05893) Contribution 100%
3. Sachit Pandey (2024AA05023) Contribution 100%
4. Avishek Ghatak (2024AA05895) Contribution 100%
5. Anoushka Guleria (2023AA05527) Contribution 100%

## 1. Introduction and Context

While exploring recent work on large language models, one pattern became very clear to us: these models look extremely capable, but they still struggle the moment a question requires up-to-date, domain-specific, or factual information. The reason is simple - an LLM only knows what was in its training data. It can generate fluent answers, but it can’t automatically access new information or expert knowledge that wasn’t part of its training set.

From reviewing several papers and research over the past few years, We noticed that researchers started questioning the conventional wisdom around 2019-2020. Instead of just throwing bigger and bigger models at problems, they wondered: what if we gave these systems the ability to look things up? What if they could retrieve relevant information from a knowledge base and then use that information to generate better answers? This idea led to Retrieval-Augmented Generation (RAG).

It’s like the difference between asking someone who has read every book up to 2020, versus asking someone who not only reads a lot but also has access to a library and can look things up on the spot. The second person will usually give more accurate answers, especially for recent or specialized topics.

The core idea behind RAG is simple but powerful: combine information retrieval with text generation. When someone asks a question, the system first searches through available documents to find relevant information, then uses that information as context when generating an answer. This approach has been gaining significant traction recently because it addresses several problems that plague traditional language models.

## 2. How RAG Actually Works: The Two-Stage Process

RAG systems typically operate in two distinct phases. First comes retrieval. When you pose a question or query, the system searches through a collection of documents—could be Wikipedia, academic papers, company documents, whatever—to find passages that might be relevant. This is where the "retrieval" part comes in.

The second phase is generation. Once relevant documents are found, they're fed into a language model along with your original question. The language model then generates an answer, ideally grounded in the retrieved information. This is the "augmented generation" part.

Its strength comes from letting retrieval and generation work together, so the system doesn’t depend on one huge model each part does what it’s best at.

<img width="977" height="650" alt="image" src="https://github.com/user-attachments/assets/cd017043-c272-4c7a-a159-5234f4dcb1bd" />

### Early Development and Key Players

When we looked into how modern neural RAG systems evolved, one pattern became clear: a lot of the recent momentum came from Facebook AI Research around 2020, especially through DPR (Dense Passage Retrieval) and the RAG framework. A key milestone was the framework introduced by Lewis et al. (2020), which combined a DPR with a sequence-to-sequence generator (BART). The significance of this model was not only the pairing of retrieval and generation, but the fact that the entire system could be trained end-to-end allowing the retriever and generator to reinforce each other during learning.

Following the initial RAG framework, several refinements appeared. FiD (Izacard & Grave, 2021) introduced a more effective way to process multiple retrieved documents by encoding each one separately before combining the results. RETRO went a step further by integrating retrieval directly into the transformer architecture, rather than treating it as an external step. REALM (Guu et al., 2020) demonstrated that retrieval and language modeling could be learned together, grounding answers in factual sources. Later, Atlas (Izacard et al., 2022) showed that a retriever and generator could be jointly trained from scratch at scale, improving consistency across tasks.HyDE (Gao et al., 2023) introduced a clever idea where the model first generates a hypothetical answer and uses it as the retrieval query, improving search accuracy in RAG systems. Each of these models targeted a different limitation in earlier approaches.

<img width="2226" height="454" alt="image" src="https://github.com/user-attachments/assets/1a79a566-0020-47d5-bf7a-c847ed4f2de6" />

## 3. Different Approaches to Retrieval

When we looked into how retrieval actually works in RAG systems, we realised there are several ways models can search for information, and each one comes with its own pros and cons.

Keyword-based retrieval (like BM25) is the classic method. It basically checks which documents contain the same words as our query. It’s fast, it doesn’t need training, and it works well for direct, literal questions. The downside is that it doesn’t understand meaning. For example, if the query says “four-wheeled vehicle” but the document says “automobile” keyword search won’t match them.

Dense retrieval takes a more semantic approach. Instead of matching words, it converts queries and documents into numerical vectors that capture meaning. This lets it retrieve relevant information even when no keywords overlap.
Karpukhin et al. (2020) showed that this works extremely well, but it does require model training and more compute.

Hybrid retrieval is becoming popular because it mixes both ideas. Keyword search gives broad coverage, and dense retrieval ranks the results more intelligently. This tends to make retrieval more reliable across different types of queries.

And then comes the new trend: large context windows. Some modern LLMs can handle huge inputs (tens of thousands of tokens), so instead of using a complex retrieval pipeline, many systems simply dump a lot of information into the context and let the model pick what matters. It’s not always efficient, but in many cases it works surprisingly well.

## 4. Real-World Applications and Why This Matters

These ideas matter because retrieval‑augmented systems are already embedded in real products and workflows.

**Question answering** systems are using this. Customer-support bots look up relevant help articles and use them to answer questions, showing the exact source. Older LLM-only bots would sometimes make up answers, but retrieval keeps the response tied to real information.

**Fact verification** RAG is a natural fit. the system retrieves evidence first and then generates a judgment conditioned on that evidence. Hallucinations do not vanish completely, but they become easier to spot and reduce because the model is encouraged to stay close to retrieved sources instead of free‑associating.

**Professional domains** are also using this. Legal research tools use retrieval to find relevant case laws and then summarize them. Healthcare and biomedical assistants retrieve guidelines or research papers to support clinical decisions, and some hospital systems even retrieve similar historical cases to help interpret scans or patient reports. In such settings, the ability to show citations or supporting excerpts is essential

Across all of these applications, the same pattern holds: accuracy and traceability are crucial. A stand-alone LLM may produce fluent answers, but a RAG system provides the underlying documents, making it easier for users to verify and trust the output

## 5. Current Challenges and Limitations

**Retrieval failures are still common.** When a query is phrased very differently from how the information is stored, the retriever can simply miss the right documents. This shows up repeatedly in recent work: systems need query reformulation, re‑ranking, and fallback strategies, yet retrieval errors remain a major failure mode.

**Context overload is real.** Retrieving several long documents often brings in contradictions, noise, or partially relevant content. The generator then has to decide what to trust, and it can latch onto the wrong passage or get confused by conflicting evidence.

**There's latency overhead.** Every request triggers at least one retrieval step before generation, which adds extra network and compute cost. At production scale, with thousands of concurrent users, this impacts both response times and infrastructure spend.

**Hallucinations still occur.** Even when the correct documents are retrieved, models can still generate details that aren't actually present in those sources. Current research is exploring ways to constrain generation or use reinforcement learning to keep models grounded, but this problem is far from fully solved.

**Knowledge updates sound easy but aren't.** In theory, RAG lets us refresh information by simply updating the documents, no retraining needed. But in practice, we still have to maintain clean, consistent content, decide when outdated info should be replaced or kept for context, and manage document versions. So the actual process is more complicated than it seems.

## 6. Recent Trends and Where the Field Is Heading

In reviewing recent work, a few patterns stand out.

First, **intelligent, adaptive retrieval** is a major focus. New systems do not just retrieve by default; they learn when to retrieve, what to retrieve, and how many documents are actually useful. Some models even generate intermediate reasoning steps that steer multi‑hop retrieval, so the retrieval process itself becomes part of the model’s reasoning loop

**Multimodal RAG** is spreading. Instead of working only over text, newer models can retrieve and condition on images, tables, and other structured content, making tasks like visual question answering and rich document understanding increasingly practical in real applications.

**Reasoning-aware retrieval** is another area gaining traction. Different questions demand different evidence: simple fact questions benefit from precise factual passages, while complex reasoning questions may require chains of documents or diverse perspectives. Current research is focused on teaching systems to recognize these differences and adapt their retrieval strategy accordingly.

On the engineering side **efficiency improvements are massive**. Lightweight models, approximate nearest‑neighbor search, and aggressive caching have made it realistic to deploy RAG systems at scale, not just in research prototypes but in production services that handle large query volumes.

Then there's **end-to-end optimization**. Rather than training retrievers and generators separately, newer models train both components jointly on task‑specific data, which tends to produce better alignment between what is retrieved and how it is used. Work like RETRO (Borgeaud et al., 2021) and Atlas (Izacard et al., 2022) demonstrates the benefits of this kind of tightly coupled training.

**Examples (2023–2025):**

**Adaptive retrieval:** CTRLA (ACL 2025), Reflective Tagging (Electronics 2024).
**Hybrid dense + sparse retrieval:** HyDE, multi‑agent hybrid retriever (KDD 2025).
**Multimodal RAG:** MMORE (2025), MIND‑RAG (ICCV Workshop 2025).
**Long‑context LLMs + RAG:** GPT‑4‑style and Gemini‑style systems with large context windows.

## 7. Comparison with Alternative Approaches

How does RAG stack up against other approaches?

**Fine-tuning** is traditional: pretrain a model, then continue training it on task‑specific data. It can work very well, especially when we have high‑quality labeled examples and a fairly stable domain. The downsides are that it requires significant data and compute, and the knowledge it encodes is essentially static, updating facts usually means running another training cycle.

RAG differs fundamentally. Its knowledge is updated in a live way: i.e we change or add documents in the index instead of retraining the model’s weights. The cost is extra delay, because every user query has to run a retrieval step before the model answers.

**In-context prompting** (enabled by huge context windows in recent models) is conceptually similar. Instead of running a separate retrieval step, all the potentially relevant material is put directly into the prompt. This is easier to set up and avoids some retrieval mistakes, but it wastes a lot of tokens and can overload the model with irrelevant text, which sometimes hurts answer quality.

In practice, the right method depends on the use case. When the underlying knowledge changes frequently (news, pricing, policies), RAG is usually a better fit because you can update the document index without retraining the model. For occasional, one-off questions where slightly higher latency is acceptable, RAG is often more practical than running a full fine‑tuning pipeline. In narrow, specialized domains with relatively stable knowledge and some high‑quality labeled data, fine‑tuning a model on that domain can give stronger performance. Many real systems therefore combine these ideas like, using RAG for freshness and coverage, and fine‑tuning to adapt the model’s style, tools, or reasoning to a specific domain.

## 8. Conclusion

Retrieval‑Augmented Generation is a practical way to address real weaknesses in language models. Instead of relying on larger models that try to memorize everything, it splits the work: specialized retrieval finds the information, and a generator turns that evidence into text.

RAG is no longer just an experiment; major AI systems now use it in production, and research continues to push it forward with new retrieval methods, better fusion strategies, and more end‑to‑end training setups. Work like Lewis et al. (2020) helped define the modern RAG framework, and the ecosystem around it has grown rapidly since then.

Its strengths are clear: answers can be grounded in explicit sources, knowledge can be updated without retraining model weights, and it scales well to specialized domains when paired with good corpora. The trade‑offs-extra system complexity, latency from retrieval, and sensitivity to retrieval quality are real, but in many applications they are a worthwhile price for greater accuracy, transparency, and control.

## References

Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. _Advances in Neural Information Processing Systems_,

- Lewis, P., Perez, E., Piktus, A., Schwenk, H., Schwab, D., & Riedel, S. (2020). 33, 9459-9474. https://arxiv.org/abs/2005.11401

Dense Passage Retrieval for Open-Domain Question Answering. _arXiv preprint arXiv:2004.04906_.

- Karpukhin, V., Oğuz, B., Min, S., Lewis, P., Wu, L., Edunov, S., & Schwenk, H. (2020). https://arxiv.org/abs/2004.04906
- GitHub: https://github.com/facebookresearch/DPR

Leveraging Passage Retrieval to Answer Open-Domain Questions. _arXiv preprint arXiv:2107.06373_.

- Izacard, G., & Grave, E. (2021). https://arxiv.org/abs/2107.06373
- Published in EMNLP 2021

Improving Language Models by Retrieving from Trillions of Tokens. _arXiv preprint arXiv:2112.04426_.

- Borgeaud, S., Mensch, A., Hoffmann, J., Cai, T., Rutherford, E., Millican, K., & Sifre, L. (2021). https://arxiv.org/abs/2112.04426
- Project: https://deepmind.com/research/publications/improving-language-models-retrieving-trillions-tokens

Atlas: Few-shot Learning with Retrieval Augmented Language Models. _arXiv preprint arXiv:2208.03299_.

- Izacard, G., Lewis, P., Lomeli, M., Hosseini, L., Riedel, S., & Schwenk, H. (2022). https://arxiv.org/abs/2208.03299
- GitHub: https://github.com/facebookresearch/atlas
- Published in ICLR 2023

---
