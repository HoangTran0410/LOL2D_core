import Helper from "../helper/index.js";

export default class AICore {
    constructor(config = {}) {
        this.champion = null;
        this.world = null;
        this.autoAttackRadius = 300;

        Helper.Other.setValueFromConfig(this, config);

        // setup
        this.champion.removeDestination();
        this.mode = "attack";
    }

    update() {
        this.autoChangeMode();
        this.autoMove();
        this.autoAttack();
        this.autoDefense();
    }

    autoShow() {
        noFill();
        stroke("#fff2");
        strokeWeight(1);

        circle(
            this.champion.position.x,
            this.champion.position.y,
            this.autoAttackRadius * 2
        );
    }

    autoMove() {
        // basic move
        if (this.mode == "attack") {
            if (this.champion.isArrivedDestination()) {
                let zone = 700;
                let { width, height } = this.champion.world.groundMap;
                this.champion.destination.set(
                    width * 0.5 + random(-zone, zone),
                    height * 0.5 + random(-zone, zone)
                );
            }
        }
    }

    autoAttack() {
        // get all enemies in range
        const enemies = Helper.Distance.getChampionsInRange({
            rootPosition: this.champion.position,
            champions: this.world.champions,
            inRange: this.autoAttackRadius,
            allyWithPlayer: !this.champion.isAllyWithPlayer,
            excludes: [this.champion],
        });

        // reset target champ
        this.totalEnemyHealth = 0;
        this.targetChamp = null;

        if (enemies.length > 0) {
            // find champion that have lowest health
            let target = enemies[0];
            for (let e of enemies) {
                this.totalEnemyHealth += e.health;
                if (e.health <= target.health) {
                    target = e;
                }
            }

            // spell to it - add random check here to decrease power of AI :)
            if (random(1) < 0.1) {
                const dest = target.position.copy();
                const spellId = random([
                    "spell1",
                    "spell2",
                    "spell3",
                    "spell4",
                    "avatarSpell1",
                    "basicAttack",
                ]);

                this.champion.castSpell(spellId, dest);
            }

            // get closer to targetChamp
            let followRange = 250; // this.champion.attackRange; // not available yet
            let shouldFollow =
                // check health
                this.champion.health >= target.health &&
                // check distance
                p5.Vector.dist(this.champion.destination, target.position) >
                    followRange;

            if (shouldFollow) {
                let vec = target.position
                    .copy()
                    .add(
                        random(-followRange, followRange),
                        random(-followRange, followRange)
                    );

                this.champion.destination.set(vec.x, vec.y);
                // save to use in autoChangeMode
                this.targetChamp = target;
            }
        }
    }

    autoDefense() {
        // move to turret if health is low
        if (this.mode == "defense") {
            if (this.champion.isAllyWithPlayer)
                this.champion.destination.set(
                    this.champion.radius * 2,
                    this.champion.world.groundMap.height -
                        this.champion.radius * 2
                );
            else
                this.champion.destination.set(
                    this.champion.world.groundMap.width -
                        this.champion.radius * 2,
                    this.champion.radius * 2
                );
        }
    }

    autoChangeMode() {
        if (this.mode == "defense") {
            let fullResources =
                this.champion.health > this.champion.maxHealth * 0.9 &&
                this.champion.mana > this.champion.maxMana * 0.9;

            let moreHealthThanEnemy =
                this.totalEnemyHealth != 0 &&
                this.champion.health >= this.totalEnemyHealth;

            if (fullResources || moreHealthThanEnemy) {
                this.mode = "attack";
                this.champion.removeDestination(); // go back to attack zone
            }
        } else {
            let outOfResources =
                this.champion.health < this.champion.maxHealth * 0.5 ||
                this.champion.mana < this.champion.maxMana * 0.2;

            let lessHealthThanEnemy =
                this.totalEnemyHealth != 0 &&
                this.champion.health < this.totalEnemyHealth;

            if (lessHealthThanEnemy || outOfResources) {
                this.mode = "defense";
            }
        }
    }
}
