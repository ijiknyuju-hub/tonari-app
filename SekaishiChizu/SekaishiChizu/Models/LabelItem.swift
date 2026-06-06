import Foundation
import CoreGraphics

struct LabelItem: Identifiable, Codable {
    let id: UUID
    var text: String
    var x: Double
    var y: Double

    var position: CGPoint {
        get { CGPoint(x: x, y: y) }
        set { x = newValue.x; y = newValue.y }
    }

    init(id: UUID = UUID(), text: String, position: CGPoint) {
        self.id = id
        self.text = text
        self.x = position.x
        self.y = position.y
    }
}
