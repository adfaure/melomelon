module.exports = {
    updateStats: function (tab, title, action) {
        console.assert(action == "played" && action == "polled");

        chrome.storage.local.get(["stats"], (result) => {
            var stats = {};
            if (result["stats"] == null) {
                stats = {};
            } else {
                stats = result["stats"];
            }

            if (stats[title] == null) {
                stats[title] = {
                    url: tab.url,
                    raw_title: tab.title,
                    polled: 0,
                    played: 0
                };
                stats[title][action] = 1;
            } else if (stats[title][action] == null) {
                stats[title][action] = 1;
            } else {
                stats[title][action]++;
            }

            chrome.storage.local.set({ "stats": stats })
        })
    }
}