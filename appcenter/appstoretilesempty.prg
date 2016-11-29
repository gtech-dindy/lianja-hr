//
// Lianja App Store tile definitions
//
text raw

/*--------------------------------------------------------------------------------*/
/* Sections                                                                       */
/*--------------------------------------------------------------------------------*/
window.AppStoreTiles = [
    {
	name : "Recommended Apps",
        tiles: [
           { id: "lianjademo", name: "lianjademo" },
           { id: "lianjawebdemo", name:"lianjawebdemo" },
           { id: "lianjacustomcanvas", name:"lianjacustomcanvas" }         
        ]
	},
    {
	name : "Latest Apps",
        tiles: [
           { id: "lianjademo", name: "lianjademo" },
           { id: "lianjawebdemo", name:"lianjawebdemo" },
           { id: "lianjacustomcanvas", name:"lianjacustomcanvas" }         
        ]
	}
	name : "Updated Apps",
        tiles: [
           { id: "lianjademo", name: "lianjademo" },
           { id: "lianjawebdemo", name:"lianjawebdemo" },
           { id: "lianjacustomcanvas", name:"lianjacustomcanvas" }         
        ]
	}
];

/*--------------------------------------------------------------------------------*/
window.AppStoreTiles = _.map(window.AppStoreTiles, function (section) {
    return "" + section.name + "~" + (_.map(section.tiles, function (tile) {
        return "" + tile.id + "," + tile.name;
    })).join(".");
}).join("|");

/*--------------------------------------------------------------------------------*/
/* Tiles                                                                          */
/*--------------------------------------------------------------------------------*/
window.TileBuilders  = {
    lianjademo: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjawebsite",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Demo",
            color: "bg-color-darken",
            onClick: 'addTile("lianjademo")'
       };
    },

    lianjawebdemo: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "amazon",
            color: "bg-color-green",
            label: "Web Demo",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            appTitle: "Getting Started",
            onClick: 'addTile("lianjademo")'
        };
    },

    lianjacustomcanvas: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "tutorials",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Custom Canvas",
            color: "bg-color-blueDark",
            onClick: 'addTile("lianjademo")'
 
	   };
	}
};

endtext
