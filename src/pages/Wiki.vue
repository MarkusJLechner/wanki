<template>
  <div>
    <TheHeader title="Wiki" back-button>
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>
    <MainContent>
      <div class="space-y-4 p-4">
        <p>
          Wanki is a web-based flashcard app inspired by Anki. It lets you study
          cards in your browser and works offline once installed.
        </p>
        <h2 class="text-lg font-bold">Deck</h2>
        <p>
          A deck is a collection of cards that you study together. You can have
          multiple decks for different subjects.
        </p>
        <h2 class="text-lg font-bold">Note</h2>
        <p>
          Notes hold your raw information. Each note contains fields such as
          "Front" and "Back". Cards are generated from notes using templates.
        </p>
        <h2 class="text-lg font-bold">Card</h2>
        <p>
          Cards are what you review. A single note can produce several cards
          depending on the template. Cards track scheduling information like due
          date and ease.
        </p>
        <h2 class="text-lg font-bold">Template</h2>
        <p>
          Templates define how the fields of a note are shown on the front and
          back of a card. You can edit templates to customize the appearance of
          your cards.
        </p>
        <h2 class="text-lg font-bold">Model</h2>
        <p>
          Models tie together fields and templates. They describe what kind of
          notes you can create (for example Basic or Cloze).
        </p>
        <h2 class="text-lg font-bold">Review</h2>
        <p>
          During review you answer cards and tell Wanki how well you remembered
          them. The scheduler uses this feedback to decide when you should see a
          card again.
        </p>
      </div>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import MainContent from '@/components/MainContent.vue'
</script>
