//
// Lianja App Store tile definitions
//
text raw

/*--------------------------------------------------------------------------------*/
/* Sections                                                                       */
/*--------------------------------------------------------------------------------*/
window.AppStoreTiles = [
    /*
	{
	name : "New and Noteworthy",
        tiles: [
           { id: "lianjademo", name: "lianjademo" },
           { id: "lianjawebdemo", name:"lianjawebdemo" },
           { id: "lianjacustomcanvas", name:"lianjacustomcanvas" }         
        ]
	},
	{
	name : "Latest Updated Apps",
        tiles: [
           { id: "lianjademo", name: "lianjademo" },
           { id: "lianjawebdemo", name:"lianjawebdemo" },
           { id: "lianjacustomcanvas", name:"lianjacustomcanvas" }         
        ]
	},
	*/
	{
	name : "Categories",
        tiles: [
           { id: "business", name: "business" },
           { id: "developertools", name:"developertools" } ,        
           { id: "education", name:"education" } ,        
           { id: "finance", name:"finance" },
           { id: "productivity", name:"productivity" }
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
	},

    business: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "business",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Business",
            color: "bg-color-darken"
       };
    },

    developertools: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "developertools",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Developer Tools",
            color: "bg-color-darken"
       };
    },

    education: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "finance",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Education",
            color: "bg-color-darken"
       };
    },

    finance: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "finance",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Finance",
            color: "bg-color-darken"
       };
    },

    humanresources: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "humanresources",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Human Resources",
            color: "bg-color-darken"
       };
    },

    productivity: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "productivity",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Productivity",
            color: "bg-color-darken"
       };
    }

};

endtext
