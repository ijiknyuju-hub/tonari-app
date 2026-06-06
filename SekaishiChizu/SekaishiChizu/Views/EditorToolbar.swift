import SwiftUI

enum EditorTool: CaseIterable, Equatable, Hashable {
    case pencil, label, eraser

    var icon: String {
        switch self {
        case .pencil:  return "pencil.tip"
        case .label:   return "character.cursor.ibeam"
        case .eraser:  return "eraser"
        }
    }

    var title: String {
        switch self {
        case .pencil:  return "描く"
        case .label:   return "ラベル"
        case .eraser:  return "消す"
        }
    }
}

struct EditorToolbar: View {
    @Binding var activeTool: EditorTool
    @Binding var isReviewMode: Bool
    var onSave: () -> Void
    var onExport: () -> Void

    var body: some View {
        HStack(spacing: 8) {
            ForEach(EditorTool.allCases, id: \.self) { tool in
                toolButton(tool)
            }

            Divider().frame(height: 36)

            Button { isReviewMode.toggle() } label: {
                buttonLabel(
                    icon: isReviewMode ? "eye.slash.fill" : "eye",
                    text: isReviewMode ? "復習中" : "復習"
                )
                .frame(width: 60, height: 50)
                .background(isReviewMode ? Color.orange : Color(.systemGray5))
                .foregroundStyle(isReviewMode ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            Divider().frame(height: 36)

            Button(action: onSave) {
                buttonLabel(icon: "square.and.arrow.down", text: "保存")
                    .frame(width: 60, height: 50)
                    .background(Color(.systemGray5))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            Button(action: onExport) {
                buttonLabel(icon: "square.and.arrow.up", text: "書き出し")
                    .frame(width: 68, height: 50)
                    .background(Color(.systemGray5))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.12), radius: 6, y: 2)
    }

    private func toolButton(_ tool: EditorTool) -> some View {
        Button { activeTool = tool } label: {
            buttonLabel(icon: tool.icon, text: tool.title)
                .frame(width: 60, height: 50)
                .background(activeTool == tool ? Color.blue : Color(.systemGray5))
                .foregroundStyle(activeTool == tool ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    private func buttonLabel(icon: String, text: String) -> some View {
        VStack(spacing: 3) {
            Image(systemName: icon).font(.system(size: 18))
            Text(text).font(.caption2)
        }
    }
}
