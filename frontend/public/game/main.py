# frontend/public/game/main.py

import pygame
import random
import os
import asyncio # Import asyncio for the web environment

# --- Constants ---
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

# Player properties
PLAYER_ACC = 0.5
PLAYER_FRICTION = -0.12
PLAYER_GRAVITY = 0.8
PLAYER_JUMP = -18

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)

# --- Asset Setup ---
# In PyScript, the paths are relative to the HTML file
assets_folder = 'game/assets' # Correct path for web

# --- Classes (COPY ALL YOUR CLASSES HERE) ---
# Player, Platform, Asteroid, Bullet classes remain EXACTLY THE SAME.
# I am omitting them here for brevity, but you must copy them into this file.
class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        player_img = pygame.image.load(os.path.join(assets_folder, "player.png")).convert()
        self.image = pygame.transform.scale(player_img, (50, 38))
        self.image.set_colorkey(BLACK)
        self.rect = self.image.get_rect()
        self.pos = pygame.math.Vector2(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 50)
        self.vel = pygame.math.Vector2(0, 0)
        self.acc = pygame.math.Vector2(0, 0)
        self.rect.midbottom = self.pos

    def update(self):
        self.acc = pygame.math.Vector2(0, PLAYER_GRAVITY)
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            self.acc.x = -PLAYER_ACC
        if keys[pygame.K_RIGHT]:
            self.acc.x = PLAYER_ACC
        self.acc.x += self.vel.x * PLAYER_FRICTION
        self.vel += self.acc
        self.pos += self.vel + 0.5 * self.acc
        if self.pos.x > SCREEN_WIDTH:
            self.pos.x = 0
        if self.pos.x < 0:
            self.pos.x = SCREEN_WIDTH
        self.rect.midbottom = self.pos

    def jump(self):
        self.rect.y += 1
        hits = pygame.sprite.spritecollide(self, platforms, False)
        self.rect.y -= 1
        if hits:
            self.vel.y = PLAYER_JUMP

    def shoot(self):
        bullet = Bullet(self.rect.centerx, self.rect.top)
        all_sprites.add(bullet)
        bullets.add(bullet)

class Platform(pygame.sprite.Sprite):
    def __init__(self, x, y, w, h):
        super().__init__()
        self.image = pygame.Surface((w, h))
        self.image.fill((150, 150, 150))
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y

class Asteroid(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        asteroid_img = pygame.image.load(os.path.join(assets_folder, "asteroid.png")).convert()
        self.image = pygame.transform.scale(asteroid_img, (40, 40))
        self.image.set_colorkey(BLACK)
        self.rect = self.image.get_rect()
        self.rect.x = random.randrange(SCREEN_WIDTH - self.rect.width)
        self.rect.y = random.randrange(-100, -40)
        self.speedy = random.randrange(1, 8)

    def update(self):
        self.rect.y += self.speedy
        if self.rect.top > SCREEN_HEIGHT + 10:
            self.rect.x = random.randrange(SCREEN_WIDTH - self.rect.width)
            self.rect.y = random.randrange(-100, -40)
            self.speedy = random.randrange(1, 8)

class Bullet(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        bullet_img = pygame.image.load(os.path.join(assets_folder, "bullet.png")).convert()
        self.image = pygame.transform.scale(bullet_img, (10, 20))
        self.image.set_colorkey(BLACK)
        self.rect = self.image.get_rect()
        self.rect.bottom = y
        self.rect.centerx = x
        self.speedy = -10

    def update(self):
        self.rect.y += self.speedy
        if self.rect.bottom < 0:
            self.kill()


# --- Global scope for game objects ---
# These need to be accessible by the main async loop
pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Astro-Platformer")
clock = pygame.time.Clock()
background = pygame.image.load(os.path.join(assets_folder, 'background.png')).convert()
background_rect = background.get_rect()

font_name = pygame.font.match_font('arial')
def draw_text(surf, text, size, x, y):
    font = pygame.font.Font(font_name, size)
    text_surface = font.render(text, True, WHITE)
    text_rect = text_surface.get_rect()
    text_rect.midtop = (x, y)
    surf.blit(text_surface, text_rect)

all_sprites = pygame.sprite.Group()
platforms = pygame.sprite.Group()
asteroids = pygame.sprite.Group()
bullets = pygame.sprite.Group()

player = Player()
all_sprites.add(player)
p1 = Platform(0, SCREEN_HEIGHT - 40, SCREEN_WIDTH, 40)
p2 = Platform(200, 400, 150, 20)
p3 = Platform(450, 300, 150, 20)
all_sprites.add(p1, p2, p3)
platforms.add(p1, p2, p3)

for i in range(8):
    a = Asteroid()
    all_sprites.add(a)
    asteroids.add(a)

score = 0
# --- NEW ASYNC GAME LOOP ---
async def main():
    global score # Declare score as global to modify it
    running = True
    while running:
        clock.tick(FPS)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    player.jump()
                if event.key == pygame.K_SPACE:
                    player.shoot()

        all_sprites.update()

        if player.vel.y > 0:
            hits = pygame.sprite.spritecollide(player, platforms, False)
            if hits:
                player.pos.y = hits[0].rect.top + 1
                player.vel.y = 0

        hits = pygame.sprite.groupcollide(asteroids, bullets, True, True)
        for hit in hits:
            score += 10
            a = Asteroid()
            all_sprites.add(a)
            asteroids.add(a)

        hits = pygame.sprite.spritecollide(player, asteroids, False)
        if hits:
            running = False

        screen.blit(background, background_rect)
        all_sprites.draw(screen)
        draw_text(screen, str(score), 24, SCREEN_WIDTH / 2, 10)

        pygame.display.flip()

        await asyncio.sleep(0) # IMPORTANT: give control back to the browser

# This is the command that PyScript will run
asyncio.run(main())