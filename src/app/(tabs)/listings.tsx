import { Text, View } from "react-native";
import {ListingsCard} from "@/types/types";
import ListingCard from '@/components/ListingCard'

export default function Listings() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ListingCard imageUrl={} title={`{title}`} price={} description={} location={} views={} sellerHandle={}
    </View>
  );
}
