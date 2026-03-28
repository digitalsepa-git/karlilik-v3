import { useEffect, useRef } from 'react';
import { glossaryTerms } from '../data/glossaryTerms';

export const useGlossaryTooltip = () => {
    const processedNodes = useRef(new WeakSet());

    useEffect(() => {
        const tooltip = document.getElementById('glossary-tooltip');
        const tooltipTerm = document.getElementById('tooltip-term');
        const tooltipDesc = document.getElementById('tooltip-desc');

        if (!tooltip || !tooltipTerm || !tooltipDesc) return;

        const processNode = (node) => {
            // Skip if already processed
            if (processedNodes.current.has(node)) return;

            // Check if it's an article-content root or inside one
            // If we are observing body, we might catch the article-content div itself
            if (node.classList && node.classList.contains('article-content')) {
                scanAndReplace(node);
                processedNodes.current.add(node);
            } else {
                // Check children
                const articles = node.querySelectorAll ? node.querySelectorAll('.article-content') : [];
                articles.forEach(article => {
                    if (!processedNodes.current.has(article)) {
                        scanAndReplace(article);
                        processedNodes.current.add(article);
                    }
                });
            }
        };

        const scanAndReplace = (element) => {
            if (element.getAttribute('data-glossary-processed')) return;

            const terms = Object.keys(glossaryTerms).sort((a, b) => b.length - a.length);

            // Helper to collect text nodes
            const getTextNodes = (el) => {
                const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
                let n;
                const nodes = [];
                while (n = walker.nextNode()) nodes.push(n);
                return nodes;
            };

            const textNodes = getTextNodes(element);

            textNodes.forEach(node => {
                let text = node.nodeValue;
                // Validate: check if parent is already a link or glossary term or script/style
                const parent = node.parentNode;
                if (!text.trim() ||
                    parent.tagName === 'A' ||
                    parent.tagName === 'BUTTON' ||
                    parent.tagName === 'SCRIPT' ||
                    parent.tagName === 'STYLE' ||
                    parent.classList.contains('glossary-term')) return;

                // Find matches
                // We do a single pass replacement for valid terms
                // To handle multiple terms in one node, we have to rebuild the node safely

                // Regex construction for all terms at once? 
                // Or iterative? Iterative is safer for complex replacements but trickier with HTML injection.
                // Let's go with the previous approach but carefully.

                let hasMatch = false;
                let currentText = text;

                // Checking availability of terms in this text node
                // Only replace if a term exists
                const presentTerms = terms.filter(term => {
                    const regex = new RegExp(`\\b(${term})\\b`, 'i'); // Check existence
                    return regex.test(currentText);
                });

                if (presentTerms.length === 0) return;

                // Create a temp placeholder strategy or just simple string replace?
                // Simple string replace with HTML is risky if we replace inside HTML tags we just added.
                // But here we are starting from a TextNode (nodeValue). So no tags inside yet.

                presentTerms.forEach(term => {
                    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
                    // Wrap with unique placeholder/marker?
                    // Or just do the replace.
                    currentText = currentText.replace(regex, (match) => {
                        hasMatch = true;
                        return `<span class="glossary-term term-highlight border-b border-dashed border-indigo-400 cursor-help text-indigo-700 font-medium hover:bg-indigo-50 transition-colors relative" data-term="${term}">${match}</span>`;
                    });
                });

                if (hasMatch) {
                    const wrapper = document.createElement('span');
                    // preserve whitespace? span default is inline, so should be fine.
                    wrapper.innerHTML = currentText;

                    // Replace the text node with the new span's children (invisible wrapper)
                    // Actually, just replacing matched node with the wrapper content is easier.
                    // But wrapper itself is a span.
                    // To avoid nesting the whole paragraph in a span, we can insert wrapper children?
                    // Or just use the wrapper as the container for that text segment.
                    // Let's use the wrapper span but make it display contents? 
                    // Wait, <span innerHTML="..."> produces elements.
                    // We can replace the textNode with the wrapper.

                    // However, wrapper is an element. textNode is a node.
                    // parent.replaceChild(wrapper, node); works.
                    // But wrapper adds a span around non-matched text too if we aren't careful?
                    // Yes. But <span>text</span> is harmless usually.

                    // Better approach: Fragments?
                    // The wrapper.innerHTML parsed the HTML string into nodes.
                    // We want to insert those nodes in place of 'node'.

                    const fragment = document.createDocumentFragment();
                    Array.from(wrapper.childNodes).forEach(child => fragment.appendChild(child));
                    parent.replaceChild(fragment, node);
                }
            });

            element.setAttribute('data-glossary-processed', 'true');
        };

        // Initial scan
        processNode(document.body);

        // MutationObserver to watch for content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element
                            processNode(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Event Delegation for Tooltips (Global)
        const handleMouseOver = (e) => {
            const target = e.target.closest('.glossary-term');
            if (!target) return;

            const termKey = target.getAttribute('data-term');
            // Find case-insensitive match in dictionary
            const realKey = Object.keys(glossaryTerms).find(k => k.toLowerCase() === termKey.toLowerCase());

            if (!realKey) return;

            const data = glossaryTerms[realKey];
            if (!data) return;

            tooltipTerm.textContent = `${realKey} (${data.category})`;
            tooltipDesc.textContent = data.definition;

            tooltip.classList.remove('hidden', 'opacity-0', 'scale-95');
            tooltip.classList.add('opacity-100', 'scale-100');
            tooltip.style.display = 'block'; // Ensure display

            const rect = target.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            // Better positioning logic
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 8;

            // Viewport check
            // If top is offscreen (negative), flip to bottom
            if (top < 10) {
                top = rect.bottom + 8;
            }
            // If left is offscreen
            if (left < 10) left = 10;

            tooltip.style.top = `${top + window.scrollY}px`; // Add scrollY just in case, but fixed position ignores scroll... wait.
            // If tooltip is fixed, we use client rects (viewport). 
            // rect.top is relative to viewport.
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        };

        const handleMouseOut = (e) => {
            const target = e.target.closest('.glossary-term');
            if (!target) return;
            tooltip.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                if (tooltip.classList.contains('opacity-0')) {
                    tooltip.classList.add('hidden');
                    tooltip.style.display = 'none';
                }
            }, 300); // Wait for transition
        };

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);

        return () => {
            observer.disconnect();
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);
};
