import { Heading } from "@modules/common/components/ui"

const Hero = () => {
  return (
    <div className="w-full bg-white border-b border-ui-border-base">
      <div className="content-container py-16 flex flex-col items-center text-center">

        <Heading level="h1" className="text-5xl mb-4">
          Discover Trending Collectibles
        </Heading>

        <p className="text-ui-fg-subtle text-lg max-w-2xl mb-8">
          Find the best Labubu, Skullpanda, Crybaby and Pop Mart deals from trusted stores.
        </p>

        <div className="w-full max-w-xl">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border rounded-lg px-4 py-3 text-base"
          />
        </div>

      </div>
    </div>
  )
}

export default Hero
