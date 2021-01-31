export class Kid extends Phaser.GameObjects.Sprite {
    protected behaviorCode: integer; // 0: stand still, 1: wander, 2: run in circles
    protected direction: number;
    protected speed: number;

    // sound effects
    private grabbedSound: Phaser.Sound.BaseSound;
    private returnedSound: Phaser.Sound.BaseSound;

    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        this.x = params.x;
        this.y = params.y;
        
        this.anims.play('kid-idle');
        this.behaviorCode = params.behaviorCode;
        this.speed = 0;
        this.direction = 0;
        this.setDepth(800);

        // physics
        params.scene.physics.world.enable(this);
		this.body.allowGravity = false;
		this.body.collideWorldBounds = true;

        // set up sound effects
//        this.grabbedSound = this.scene.sound.add('grab', {volume: 1});
//        this.returnedSound = this.scene.sound.add('return', {volume: 1});
    }
	
    update(): void {
        const prevSpeed = this.speed;
        switch(this.behaviorCode) {
            case 0:
                this.speed = 0;
                break;
            case 1:
                let changeMovement = (Math.random() < 0.02);
                if (changeMovement) {
                    this.speed = (this.speed === 0) ? 100 : 0;
                    this.direction = Math.random() * 2 * Math.PI;
                }
                break;
            case 2:
                this.speed = 200;
                this.direction = (this.direction + 0.1) % (2 * Math.PI);
                break;
        }
        if (this.speed !== prevSpeed) {
            if (this.speed === 0) {
                this.anims.play('kid-idle');
            } else {
                this.anims.play('kid-run');
            }
        }
        const velX = this.speed * Math.sin(this.direction);
        if (velX !== 0) {
            this.flipX = velX < 0;
        }
        this.body.setVelocityX(velX);
        this.body.setVelocityY(this.speed * Math.cos(this.direction));
	}

}