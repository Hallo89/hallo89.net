(function (window, document) {
    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    window.addEventListener('load', function (ev) {
        const MutationObserver = window.MutationObserver || webkit.MutationObserver;
        const observer = new MutationObserver(function (mutations) {
            for (let el of observationMap.keys()) {
                if (mutations.some(record => [...observationMap.values()].some(arr => arr.includes(record.target)))) {
                    continue
                }
                let [upButton, downButton] = observationMap.get(el);
                upButton.style.height = el.offsetHeight / 2 + 'px';
                upButton.style.marginTop = -el.offsetHeight + 'px';
                upButton.style.width = '30px';
                upButton.style.marginLeft = (el.offsetWidth - 30) + 'px';
                downButton.style.height = el.offsetHeight / 2 + 'px';
                downButton.style.marginTop = -(el.offsetHeight / 2) + 'px';
                downButton.style.width = '30px';
                downButton.style.marginLeft = (el.offsetWidth - 30) + 'px';
            }
        });
        const observationMap = new Map();
        observer.observe(document, {
            subtree: true,
            characterData: true,
            attributes: true,
        });
        document.querySelectorAll('input[type=number]')
            .forEach(function (el) {
                const upButton = document.createElement("button");
                upButton.classList.add("plusButton");
                upButton.onclick = function () {
                    el.value = ((el.value | 0) + 1);
                };
                upButton.style.height = el.offsetHeight / 2 + 'px';
                upButton.style.marginTop = -el.offsetHeight + 'px';
                upButton.style.width = '30px';
                upButton.style.marginLeft = (el.offsetWidth - 30) + 'px';
                upButton.appendChild(document.createTextNode("+"));
                insertAfter(upButton, el);
                const downButton = document.createElement("button");
                downButton.onclick = function () {
                    el.value = ((el.value | 0) - 1);
                };
                downButton.classList.add("minusButton");
                downButton.style.height = el.offsetHeight / 2 + 'px';
                downButton.style.marginTop = -(el.offsetHeight / 2) + 'px';
                downButton.style.width = '30px';
                downButton.style.marginLeft = (el.offsetWidth - 30) + 'px';
                downButton.appendChild(document.createTextNode("-"));
                insertAfter(downButton, el);
                observationMap.set(el,[upButton, downButton]);
            });
    });
})(window, document);