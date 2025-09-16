import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// @ts-ignore
const RecordStories = ({ records }) => {
  return (
    <View style={styles.storyContainer}>
      <FlatList
        data={records}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.date}</Text>
            <Text>{item.details}</Text>
            <Text style={styles.advice}>💡 {item.advice}</Text>
          </View>
        )}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled // snap gibi tam tamına kaydırma efekti
      />
    </View>
  );
};

const styles = StyleSheet.create({
  storyContainer: {
    position: "absolute",
    top: 40,   // sol üst
    left: 10,
    height: 200,
  },
  card: {
    width: width * 0.7,
    backgroundColor: "#fff",
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontWeight: "bold", fontSize: 16 },
  advice: { marginTop: 10, fontStyle: "italic", color: "#007AFF" },
});

export default RecordStories;
