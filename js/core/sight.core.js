// https://leagueoflegends.fandom.com/wiki/Sight
class SightCore {
    constructor(config = {}) {
        this.overlay = createGraphics(windowWidth, windowHeight);
        this.outOfViewColor = "#000e";
        this.world = null;

        Helper.Other.setValueFromConfig(this, config);
    }

    run() {
        // clear overlay with overlay color
        this.overlay.clear();
        this.overlay.blendMode(BLEND);
        this.overlay.background(this.outOfViewColor);

        // remove overlay color in sight-area
        this.overlay.blendMode(REMOVE);
        this.overlay.fill(255);

        for (let champ of this.world.champions) {
            if (champ.isAllyWithPlayer) {
                const pos = this.world.camera.worldToCanvas(
                    champ.position.x,
                    champ.position.y
                );
                this.overlay.ellipse(pos.x, pos.y, 750);
            }
        }

        image(this.overlay, width / 2, height / 2);
    }

    resize(w, h) {
        this.overlay.resizeCanvas(w, h);
    }
}
